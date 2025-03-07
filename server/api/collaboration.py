import base64
import urllib.request
import uuid
from datetime import datetime, timedelta

from flasgger import swag_from
from flask import Blueprint, jsonify, request as current_request, current_app, g as request_context
from munch import munchify
from sqlalchemy import text, or_, func, bindparam, String
from sqlalchemy.orm import aliased, load_only, selectinload
from werkzeug.exceptions import BadRequest, Forbidden, MethodNotAllowed

from server.api.base import json_endpoint, query_param, replace_full_text_search_boolean_mode_chars, emit_socket
from server.api.service_group import create_service_groups
from server.auth.secrets import generate_token
from server.auth.security import confirm_collaboration_admin, current_user_id, confirm_collaboration_member, \
    confirm_authorized_api_call, \
    confirm_allow_impersonation, confirm_organisation_admin_or_manager, confirm_external_api_call, \
    is_organisation_admin_or_manager, is_application_admin, confirm_service_admin
from server.db.db import db
from server.db.defaults import (default_expiry_date, full_text_search_autocomplete_limit, cleanse_short_name,
                                STATUS_ACTIVE, STATUS_EXPIRED, STATUS_SUSPENDED, valid_uri_attributes, valid_tag_label,
                                uri_re, max_logo_bytes)
from server.db.domain import Collaboration, CollaborationMembership, JoinRequest, Group, User, Invitation, \
    Organisation, Service, ServiceConnectionRequest, SchacHomeOrganisation, Tag, ServiceGroup
from server.db.models import update, save, delete, flatten, unique_model_objects
from server.mail import mail_collaboration_invitation
from server.scim.events import broadcast_collaboration_changed, broadcast_collaboration_deleted

collaboration_api = Blueprint("collaboration_api", __name__, url_prefix="/api/collaborations")


def _del_non_disclosure_info(collaboration, json_collaboration):
    for cm in json_collaboration["collaboration_memberships"]:
        if not collaboration.disclose_email_information and not cm["role"] == "admin":
            del cm["user"]["email"]
        if not collaboration.disclose_member_information and not cm["role"] == "admin":
            del cm["user"]
    if "groups" in json_collaboration:
        for gr in json_collaboration["groups"]:
            _del_non_disclosure_info(collaboration, gr)


def _reconcile_tags(collaboration: Collaboration, tags, is_external_api=False):
    # [{'label': 'tag_uuc', 'value': 947}, {'label': 'new_tag_created', 'value': 'new_tag_created', '__isNew__': True}]
    if is_external_api or is_application_admin() or is_organisation_admin_or_manager(collaboration.organisation_id):
        # find delta, e.g. which tags to remove and which tags to add
        new_tags = [tag["value"] for tag in tags if "__isNew__" in tag and "value" in tag]

        # cleanup new tags
        new_tags = [tag_label for tag_label in new_tags if valid_tag_label(tag_label)]

        tag_identifiers = [tag["value"] for tag in tags if "__isNew__" not in tag and "value" in tag]
        tag_identifiers += [tag["id"] for tag in tags if "__isNew__" not in tag and "id" in tag]
        current_tag_ids = [tag.id for tag in collaboration.tags]
        removed_tags = [tag_id for tag_id in current_tag_ids if tag_id not in tag_identifiers]
        added_existing_tags = [tag_id for tag_id in tag_identifiers if tag_id not in current_tag_ids]

        for tag_id in removed_tags:
            tag = Tag.query.get(tag_id)
            collaboration.tags.remove(tag)
            if not tag.collaborations:
                db.session.delete(tag)
        for tag_id in added_existing_tags:
            collaboration.tags.append(Tag.query.get(tag_id))
        for tag_value in new_tags:
            collaboration.tags.append(Tag(tag_value=tag_value))


@collaboration_api.route("/admins/<service_id>", strict_slashes=False)
@json_endpoint
def collaboration_admins(service_id):
    confirm_service_admin(service_id)
    service = Service.query.get(service_id)
    collaborations = service.collaborations + flatten([o.collaborations for o in service.organisations])
    return {c.name: c.admin_emails() for c in unique_model_objects(collaborations)}, 200


@collaboration_api.route("/find_by_identifier", strict_slashes=False)
@json_endpoint
def collaboration_by_identifier():
    identifier = query_param("identifier")

    collaboration = Collaboration.query \
        .options(selectinload(Collaboration.groups)) \
        .options(selectinload(Collaboration.collaboration_memberships)) \
        .filter(Collaboration.identifier == identifier) \
        .one()

    return collaboration, 200


@collaboration_api.route("/v1/<co_identifier>", strict_slashes=False, methods=["GET"])
@swag_from("../swagger/public/paths/get_collaboration_by_identifier.yml")
@json_endpoint
def api_collaboration_by_identifier(co_identifier):
    confirm_external_api_call()
    collaboration = Collaboration.query \
        .outerjoin(Collaboration.collaboration_memberships) \
        .outerjoin(CollaborationMembership.user) \
        .options(selectinload(Collaboration.services)) \
        .options(selectinload(Collaboration.tags)) \
        .options(selectinload(Collaboration.groups).selectinload(Group.collaboration_memberships)) \
        .options(selectinload(Collaboration.collaboration_memberships)
                 .selectinload(CollaborationMembership.user)) \
        .filter(Collaboration.identifier == co_identifier) \
        .one()

    organisation = request_context.external_api_organisation
    if not organisation or organisation.id != collaboration.organisation_id:
        raise Forbidden()

    return collaboration, 200


@collaboration_api.route("/v1/<co_identifier>", methods=["DELETE"], strict_slashes=False)
@swag_from("../swagger/public/paths/delete_collaboration.yml")
@json_endpoint
def delete_collaboration_api(co_identifier):
    confirm_external_api_call()

    organisation = request_context.external_api_organisation
    collaboration = Collaboration.query.filter(Collaboration.identifier == co_identifier).one()

    if not organisation or organisation.id != collaboration.organisation_id:
        raise Forbidden()

    broadcast_collaboration_deleted(collaboration.id)
    return delete(Collaboration, collaboration.id)


@collaboration_api.route("/v1/<co_identifier>/members/<user_uid>", methods=["DELETE"], strict_slashes=False)
@swag_from("../swagger/public/paths/delete_collaboration_membership.yml")
@json_endpoint
def api_delete_user_from_collaboration(co_identifier, user_uid):
    confirm_external_api_call()

    organisation = request_context.external_api_organisation
    membership = CollaborationMembership.query \
        .join(CollaborationMembership.user) \
        .join(CollaborationMembership.collaboration) \
        .filter(Collaboration.identifier == co_identifier) \
        .filter(User.uid == user_uid) \
        .one()

    if not organisation or organisation.id != membership.collaboration.organisation_id:
        raise Forbidden()

    db.session.delete(membership)
    db.session.commit()

    emit_socket(f"collaboration_{membership.collaboration.id}")
    broadcast_collaboration_changed(membership.collaboration.id)

    return None, 204


@collaboration_api.route("/name_exists", strict_slashes=False)
@json_endpoint
def name_exists():
    # Regular members can create collaboration requests, soo access to all
    name = query_param("name")
    organisation_id = int(query_param("organisation_id"))
    existing_collaboration = query_param("existing_collaboration", required=False, default="")
    res = _do_name_exists(name, organisation_id, existing_collaboration)
    return res, 200


def _do_name_exists(name, organisation_id, existing_collaboration=""):
    coll = Collaboration.query.options(load_only("id")) \
        .filter(func.lower(Collaboration.name) == func.lower(name)) \
        .filter(func.lower(Collaboration.organisation_id) == organisation_id) \
        .filter(func.lower(Collaboration.name) != func.lower(existing_collaboration)) \
        .first()
    return coll is not None


@collaboration_api.route("/short_name_exists", strict_slashes=False)
@json_endpoint
def short_name_exists():
    # Regular members can create collaboration requests, soo access to all
    name = query_param("short_name")
    organisation_id = int(query_param("organisation_id"))
    existing_collaboration = query_param("existing_collaboration", required=False, default="")
    res = _do_short_name_exists(name, organisation_id, existing_collaboration)
    return res, 200


def _do_short_name_exists(name, organisation_id, existing_collaboration=""):
    coll = Collaboration.query.options(load_only("id")) \
        .filter(func.lower(Collaboration.short_name) == func.lower(name)) \
        .filter(func.lower(Collaboration.organisation_id) == organisation_id) \
        .filter(func.lower(Collaboration.short_name) != func.lower(existing_collaboration)) \
        .first()
    return coll is not None


@collaboration_api.route("/may_request_collaboration", strict_slashes=False)
@json_endpoint
def may_request_collaboration():
    user = User.query.get(current_user_id())
    sho = user.schac_home_organisation
    if not sho:
        return False, 200
    return Organisation.query \
               .join(Organisation.schac_home_organisations) \
               .filter(SchacHomeOrganisation.name == sho).count() > 0, 200


@collaboration_api.route("/all", strict_slashes=False)
@json_endpoint
def collaboration_all():
    confirm_authorized_api_call()
    collaborations = Collaboration.query \
        .options(selectinload(Collaboration.organisation)) \
        .options(selectinload(Collaboration.tags)) \
        .all()
    return collaborations, 200


@collaboration_api.route("/search", strict_slashes=False)
@json_endpoint
def collaboration_search():
    confirm_allow_impersonation()

    res = []
    q = query_param("q")
    if q and len(q):
        base_query = "SELECT id, name, description, organisation_id FROM collaborations "
        not_wild_card = "*" not in q
        if not_wild_card:
            q = replace_full_text_search_boolean_mode_chars(q)
            base_query += f"WHERE MATCH (name, description) AGAINST (:q IN BOOLEAN MODE) " \
                          f"AND id > 0 ORDER BY NAME LIMIT {full_text_search_autocomplete_limit}"
        sql = text(base_query if not_wild_card else base_query + " ORDER BY NAME")
        if not_wild_card:
            sql = sql.bindparams(bindparam("q", type_=String))
        result_set = db.engine.execute(sql, {"q": f"{q}*"}) if not_wild_card else db.engine.execute(sql)
        res = [{"id": row[0], "name": row[1], "description": row[2], "organisation_id": row[3]} for row in result_set]
    return res, 200


# Call for LSC to get all members based on the identifier of the Collaboration
@collaboration_api.route("/members", strict_slashes=False)
@json_endpoint
def members():
    confirm_authorized_api_call()

    identifier = query_param("identifier")
    collaboration_group = aliased(Collaboration)
    collaboration_membership = aliased(Collaboration)

    users = User.query \
        .options(load_only("uid", "name")) \
        .join(User.collaboration_memberships) \
        .join(collaboration_membership, CollaborationMembership.collaboration) \
        .join(CollaborationMembership.groups) \
        .join(collaboration_group, Group.collaboration) \
        .filter(or_(collaboration_group.identifier == identifier,
                    collaboration_membership.identifier == identifier)) \
        .all()
    return users, 200


@collaboration_api.route("/", strict_slashes=False)
@json_endpoint
def my_collaborations_lite():
    include_services = query_param("includeServices", False)
    user_id = current_user_id()
    query = Collaboration.query \
        .join(Collaboration.collaboration_memberships) \
        .options(selectinload(Collaboration.organisation)) \
        .options(selectinload(Collaboration.tags))
    if include_services:
        query = query \
            .options(selectinload(Collaboration.services).selectinload(Service.allowed_organisations))

    collaborations = query \
        .filter(CollaborationMembership.user_id == user_id) \
        .all()
    return collaborations, 200


@collaboration_api.route("/lite/<collaboration_id>", strict_slashes=False)
@json_endpoint
def collaboration_lite_by_id(collaboration_id):
    confirm_collaboration_member(collaboration_id)

    collaboration = Collaboration.query \
        .options(selectinload(Collaboration.organisation).selectinload(Organisation.services)) \
        .options(selectinload(Collaboration.collaboration_memberships).selectinload(CollaborationMembership.user)) \
        .options(selectinload(Collaboration.groups).selectinload(Group.collaboration_memberships)
                 .selectinload(CollaborationMembership.user)) \
        .options(selectinload(Collaboration.services)) \
        .filter(Collaboration.id == collaboration_id).one()

    if not collaboration.disclose_member_information or not collaboration.disclose_email_information:
        json_collaboration = jsonify(collaboration).json
        _del_non_disclosure_info(collaboration, json_collaboration)
        return json_collaboration, 200

    return collaboration, 200


@collaboration_api.route("/access_allowed/<collaboration_id>", strict_slashes=False)
@json_endpoint
def collaboration_access_allowed(collaboration_id):
    try:
        confirm_collaboration_admin(collaboration_id)
        return {"access": "full"}, 200
    except Forbidden:
        confirm_collaboration_member(collaboration_id)
        return {"access": "lite"}, 200


@collaboration_api.route("/<collaboration_id>", strict_slashes=False)
@json_endpoint
def collaboration_by_id(collaboration_id):
    if collaboration_id == "v1":
        raise MethodNotAllowed()

    confirm_collaboration_admin(collaboration_id, read_only=True)

    collaboration = Collaboration.query \
        .options(selectinload(Collaboration.organisation).selectinload(Organisation.services)) \
        .options(selectinload(Collaboration.collaboration_memberships).selectinload(CollaborationMembership.user)) \
        .options(selectinload(Collaboration.groups).selectinload(Group.collaboration_memberships)
                 .selectinload(CollaborationMembership.user)) \
        .options(selectinload(Collaboration.groups).selectinload(Group.invitations)) \
        .options(selectinload(Collaboration.groups).selectinload(Group.service_group)
                 .selectinload(ServiceGroup.service)) \
        .options(selectinload(Collaboration.invitations).selectinload(Invitation.user)) \
        .options(selectinload(Collaboration.join_requests).selectinload(JoinRequest.user)) \
        .options(selectinload(Collaboration.services)) \
        .options(selectinload(Collaboration.tags)) \
        .options(selectinload(Collaboration.service_connection_requests)
                 .selectinload(ServiceConnectionRequest.service)) \
        .options(selectinload(Collaboration.service_connection_requests)
                 .selectinload(ServiceConnectionRequest.requester)) \
        .filter(Collaboration.id == collaboration_id).one()

    collaboration_json = jsonify(collaboration).json
    collaboration_json["invitations"] = [invitation for invitation in collaboration_json["invitations"] if
                                         invitation["status"] == "open"]

    return collaboration_json, 200


@collaboration_api.route("/invites", methods=["PUT"], strict_slashes=False)
@json_endpoint
def collaboration_invites():
    data = current_request.get_json()
    collaboration_id = data["collaboration_id"]
    confirm_collaboration_admin(collaboration_id)

    administrators = data.get("administrators", [])
    message = data.get("message", None)
    intended_role = data.get("intended_role", "member")
    intended_role = "member" if intended_role not in ["admin", "member"] else intended_role

    group_ids = data.get("groups", [])

    groups = Group.query \
        .filter(Group.collaboration_id == collaboration_id) \
        .filter(Group.id.in_(group_ids)) \
        .all()

    collaboration = Collaboration.query.get(collaboration_id)
    user = User.query.get(current_user_id())

    membership_expiry_date = data.get("membership_expiry_date")
    if membership_expiry_date:
        membership_expiry_date = datetime.fromtimestamp(data.get("membership_expiry_date"))
    for administrator in administrators:
        invitation = Invitation(hash=generate_token(), message=message, invitee_email=administrator,
                                collaboration=collaboration, user=user, status="open",
                                intended_role=intended_role, expiry_date=default_expiry_date(json_dict=data),
                                membership_expiry_date=membership_expiry_date, created_by=user.uid)
        invitation = db.session.merge(invitation)
        invitation.groups.extend(groups)
        db.session.commit()
        mail_collaboration_invitation({
            "salutation": "Dear",
            "invitation": invitation,
            "base_url": current_app.app_config.base_url,
            "wiki_link": current_app.app_config.wiki_link,
            "recipient": administrator
        }, collaboration, [administrator])

    emit_socket(f"collaboration_{collaboration.id}", include_current_user_id=True)

    return None, 201


@collaboration_api.route("/unsuspend", methods=["PUT"], strict_slashes=False)
@json_endpoint
def unsuspend():
    data = current_request.get_json()
    collaboration_id = data["collaboration_id"]
    confirm_collaboration_admin(collaboration_id)
    collaboration = Collaboration.query.get(collaboration_id)
    collaboration.last_activity_date = datetime.now()
    collaboration.status = STATUS_ACTIVE
    db.session.merge(collaboration)
    db.session.commit()
    return {}, 201


@collaboration_api.route("/activate", methods=["PUT"], strict_slashes=False)
@json_endpoint
def activate():
    data = current_request.get_json()
    collaboration_id = data["collaboration_id"]
    confirm_collaboration_admin(collaboration_id)
    collaboration = Collaboration.query.get(collaboration_id)
    collaboration.last_activity_date = datetime.now()
    collaboration.expiry_date = None
    collaboration.status = STATUS_ACTIVE
    db.session.merge(collaboration)
    db.session.commit()
    return {}, 201


@collaboration_api.route("/invites-preview", methods=["POST"], strict_slashes=False)
@json_endpoint
def collaboration_invites_preview():
    data = current_request.get_json()
    message = data.get("message", None)
    intended_role = data.get("intended_role", "member")

    collaboration = Collaboration.query.get(int(data["collaboration_id"]))
    confirm_collaboration_admin(collaboration.id)

    user = User.query.get(current_user_id())
    invitation = munchify({
        "user": user,
        "collaboration": collaboration,
        "intended_role": intended_role,
        "message": message,
        "hash": generate_token(),
        "expiry_date": default_expiry_date(data)
    })
    html = mail_collaboration_invitation({
        "salutation": "Dear",
        "invitation": invitation,
        "base_url": current_app.app_config.base_url,
        "wiki_link": current_app.app_config.wiki_link,

    }, collaboration, [], preview=True)
    return {"html": html}, 201


@collaboration_api.route("/", methods=["POST"], strict_slashes=False)
@json_endpoint
def save_collaboration():
    data = current_request.get_json()
    if "organisation_id" in data:
        confirm_organisation_admin_or_manager(data["organisation_id"])
        organisation = Organisation.query.get(data["organisation_id"])
        user = User.query.get(current_user_id())
    else:
        raise BadRequest("No organisation_id in POST data")
    current_user_admin = data.get("current_user_admin", False)
    if "current_user_admin" in data:
        del data["current_user_admin"]

    res = do_save_collaboration(data, organisation, user, current_user_admin)
    collaboration = res[0]
    # Prevent ValueError: Circular reference detected cause of tags
    collaboration_json = jsonify(collaboration).json
    return collaboration_json, 201


@collaboration_api.route("/v1", methods=["POST"], strict_slashes=False)
@swag_from("../swagger/public/paths/post_new_collaboration.yml")
@json_endpoint
def save_collaboration_api():
    data = current_request.get_json()
    confirm_external_api_call()
    required = ["name", "description", "short_name", "disable_join_requests", "disclose_member_information",
                "disclose_email_information", "administrators"]
    if "accepted_user_policy" in data:
        del data["accepted_user_policy"]

    organisation = request_context.external_api_organisation
    admins = list(filter(lambda mem: mem.role == "admin", organisation.organisation_memberships))
    user = admins[0].user if len(admins) > 0 else User.query.filter(
        User.uid == current_app.app_config.admin_users[0].uid).one()
    data["organisation_id"] = organisation.id
    logo = data.get("logo")
    valid_logo = False
    if logo and logo.startswith("http") and bool(uri_re.match(logo)):
        res = urllib.request.urlopen(logo)
        if res.status == 200:
            logo_bytes = res.read()
            if len(logo_bytes) < max_logo_bytes:
                data["logo"] = base64.encodebytes(logo_bytes).decode("utf-8")
                valid_logo = True
    if not valid_logo and not logo:
        data["logo"] = next(db.engine.execute(text(f"SELECT logo FROM organisations where id = {organisation.id}")))[0]

    missing = [req for req in required if req not in data]
    if missing:
        raise BadRequest(f"Missing required attributes: {missing}")
    # The do_save_collaboration strips out all non-collaboration keys
    tags = data.get("tags", None)
    # Ensure to skip current_user is CO admin check
    request_context.skip_collaboration_admin_confirmation = True

    res = do_save_collaboration(data, organisation, user, current_user_admin=False, save_tags=False)
    collaboration = res[0]
    # Prevent ValueError: Circular reference detected cause of tags
    collaboration_json = jsonify(collaboration).json
    if tags:
        # expected format [{'label': 'new_tag_created', 'value': 'new_tag_created', '__isNew__': True}]
        transformed_tags = [{"label": tag, "value": tag, "__isNew__": True} for tag in tags]
        _reconcile_tags(collaboration, transformed_tags, is_external_api=True)
        collaboration_json["tags"] = tags
    return collaboration_json, 201


def do_save_collaboration(data, organisation, user, current_user_admin=True, save_tags=True):
    _validate_collaboration(data, organisation)

    administrators = data.get("administrators", [])
    message = data.get("message", None)
    tags = data.get("tags", None)

    valid_uri_attributes(data, ["accepted_user_policy", "website_url"])

    data["identifier"] = str(uuid.uuid4())
    res = save(Collaboration, custom_json=data, allow_child_cascades=False)
    collaboration = res[0]

    if tags and save_tags:
        _reconcile_tags(collaboration, tags)

    administrators = list(filter(lambda admin: admin != user.email, administrators))
    for administrator in administrators:
        invitation = Invitation(hash=generate_token(), message=message, invitee_email=administrator,
                                collaboration_id=collaboration.id, user=user, intended_role="admin",
                                expiry_date=default_expiry_date(), status="open", created_by=user.uid)
        invitation = db.session.merge(invitation)
        mail_collaboration_invitation({
            "salutation": "Dear",
            "invitation": invitation,
            "base_url": current_app.app_config.base_url,
            "wiki_link": current_app.app_config.wiki_link,
            "recipient": administrator
        }, collaboration, [administrator])

    if current_user_admin:
        admin_collaboration_membership = CollaborationMembership(role="admin", user_id=user.id,
                                                                 collaboration_id=collaboration.id,
                                                                 created_by=user.uid, updated_by=user.uid)
        collaboration_id = collaboration.id
        db.session.merge(admin_collaboration_membership)
        db.session.commit()

        broadcast_collaboration_changed(collaboration_id)

    services = organisation.services
    for service in services:
        create_service_groups(service, res[0])

    emit_socket(f"organisation_{organisation.id}")

    return res


def _validate_collaboration(data, organisation, new_collaboration=True):
    cleanse_short_name(data)
    expiry_date = data.get("expiry_date")
    if expiry_date:
        past_dates_allowed = current_app.app_config.feature.past_dates_allowed
        dt = datetime.utcfromtimestamp(int(expiry_date)) + timedelta(hours=4)
        if not past_dates_allowed and dt < datetime.now():
            raise BadRequest(f"It is not allowed to set the expiry date ({dt}) in the past")
        data["expiry_date"] = datetime(year=dt.year, month=dt.month, day=dt.day, hour=0, minute=0, second=0)
    else:
        data["expiry_date"] = None
    # Check if the status needs updating
    if new_collaboration or "status" not in data:
        data["status"] = STATUS_ACTIVE
    else:
        collaboration = Collaboration.query.get(data["id"])
        if collaboration.status == STATUS_EXPIRED and (not expiry_date or data["expiry_date"] > datetime.now()):
            data["status"] = STATUS_ACTIVE
        if collaboration.status == STATUS_SUSPENDED:
            data["status"] = STATUS_ACTIVE

    if _do_name_exists(data["name"], organisation.id,
                       existing_collaboration="" if new_collaboration else data["name"]):
        raise BadRequest(f"Collaboration with name '{data['name']}' already exists within "
                         f"organisation '{organisation.name}'.")
    if _do_short_name_exists(data["short_name"], organisation.id,
                             existing_collaboration="" if new_collaboration else data["short_name"]):
        raise BadRequest(f"Collaboration with short_name '{data['short_name']}' already exists within "
                         f"organisation '{organisation.name}'.")
    _assign_global_urn(data["organisation_id"], data)
    data["last_activity_date"] = datetime.now()


def _assign_global_urn(organisation_id, data):
    organisation = Organisation.query.get(organisation_id)
    assign_global_urn_to_collaboration(organisation, data)


def assign_global_urn_to_collaboration(organisation, data):
    data["global_urn"] = f"{organisation.short_name}:{data['short_name']}"


@collaboration_api.route("/", methods=["PUT"], strict_slashes=False)
@json_endpoint
def update_collaboration():
    data = current_request.get_json()
    confirm_collaboration_admin(data["id"])

    organisation = Organisation.query.get(data["organisation_id"])
    _validate_collaboration(data, organisation, new_collaboration=False)

    collaboration = Collaboration.query.get(data["id"])
    if collaboration.short_name != data["short_name"]:
        for group in collaboration.groups:
            group.global_urn = f"{organisation.short_name}:{data['short_name']}:{group.short_name}"
            db.session.merge(group)

    if "tags" in data:
        _reconcile_tags(collaboration, data["tags"])

    # For updating references like services, groups, memberships there are more fine-grained API methods
    res = update(Collaboration, custom_json=data, allow_child_cascades=False)

    emit_socket(f"collaboration_{collaboration.id}")
    broadcast_collaboration_changed(collaboration.id)

    return res


@collaboration_api.route("/<collaboration_id>", methods=["DELETE"], strict_slashes=False)
@json_endpoint
def delete_collaboration(collaboration_id):
    confirm_collaboration_admin(collaboration_id)

    broadcast_collaboration_deleted(collaboration_id)
    return delete(Collaboration, collaboration_id)
