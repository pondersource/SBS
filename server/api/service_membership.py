from flask import Blueprint, request as current_request

from server.api.base import json_endpoint, emit_socket
from server.auth.security import confirm_service_admin, confirm_write_access, current_user_id, current_user_uid
from server.db.db import db
from server.db.domain import ServiceMembership, Service

service_membership_api = Blueprint("service_membership_api", __name__,
                                   url_prefix="/api/service_memberships")


@service_membership_api.route("/<service_id>/<user_id>", methods=["DELETE"], strict_slashes=False)
@json_endpoint
def delete_service_membership(service_id, user_id):
    confirm_service_admin(service_id)

    memberships = ServiceMembership.query \
        .filter(ServiceMembership.service_id == service_id) \
        .filter(ServiceMembership.user_id == user_id) \
        .all()
    for membership in memberships:
        db.session.delete(membership)

    emit_socket(f"service_{service_id}", include_current_user_id=True)

    return (None, 204) if len(memberships) > 0 else (None, 404)


@service_membership_api.route("/", methods=["POST"], strict_slashes=False)
@json_endpoint
def create_service_membership_role():
    confirm_write_access()

    service_id = current_request.get_json()["serviceId"]
    service = Service.query.get(service_id)

    service_membership = ServiceMembership(user_id=current_user_id(),
                                           service_id=service.id,
                                           role="admin",
                                           created_by=current_user_uid(),
                                           updated_by=current_user_uid())
    emit_socket(f"service_{service_id}", include_current_user_id=True)

    db.session.merge(service_membership)
    return service_membership, 201
