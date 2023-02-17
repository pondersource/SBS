import base64
from typing import List, Union

import requests

from server.api.base import application_base_url
from server.db.domain import Service, Group, User, Collaboration
from server.scim import EXTERNAL_ID_POST_FIX, SCIM_GROUPS, SCIM_USERS
from server.scim.group_template import create_group_template, update_group_template, scim_member_object
from server.scim.repo import all_scim_groups_by_service, all_scim_users_by_service
from server.scim.schema_template import SCIM_SCHEMA_SRAM_USER, SCIM_SCHEMA_SRAM_GROUP
from server.scim.scim import scim_headers, validate_response
from server.scim.user_template import create_user_template, replace_none_values, update_user_template


def _replace_empty_string_values(d: dict):
    for k, v in d.items():
        if isinstance(v, dict):
            _replace_empty_string_values(v)
        elif v == "":
            d[k] = None
    return d


def _user_changed(user: User, remote_user: dict):
    remote_user = _replace_empty_string_values(remote_user)
    if remote_user.get("userName") != user.username:
        return True
    if remote_user.get("name", {}).get("givenName") != user.given_name:
        return True
    if remote_user.get("name", {}).get("familyName") != user.family_name:
        return True
    if remote_user.get("displayName") != user.name:
        return True
    if remote_user.get("active") is user.suspended:
        return True
    if remote_user.get("emails", [{"value": None}])[0].get("value") != user.email:
        return True
    ssh_keys = sorted([base64.b64encode(ssh_key.ssh_value.encode()).decode() for ssh_key in user.ssh_keys])
    remote_ssh_keys = sorted([c.get("value") for c in remote_user.get("x509Certificates", [])])
    if remote_ssh_keys != ssh_keys:
        return True
    if SCIM_SCHEMA_SRAM_USER in remote_user:
        if remote_user[SCIM_SCHEMA_SRAM_USER].get("eduPersonScopedAffiliation") != user.affiliation:
            return True
        if remote_user[SCIM_SCHEMA_SRAM_USER].get("eduPersonUniqueId") != user.uid:
            return True
        if remote_user[SCIM_SCHEMA_SRAM_USER].get("voPersonExternalAffiliation") != user.scoped_affiliation:
            return True
        if remote_user[SCIM_SCHEMA_SRAM_USER].get("voPersonExternalId") != user.eduperson_principal_name:
            return True
    return False


def _group_changed(group: Union[Group, Collaboration], remote_group: dict, remote_scim_users: List[dict]):
    remote_group = _replace_empty_string_values(remote_group)
    if remote_group.get("displayName") != group.name:
        return True
    sram_members = sorted([member.user.external_id for member in group.collaboration_memberships if member.is_active])
    remote_users_by_id = {u["id"]: u for u in remote_scim_users}
    remote_members = []
    for remote_member in remote_group.get("members", []):
        remote_user = remote_users_by_id.get(remote_member["value"])
        if remote_user:
            remote_members.append(remote_user["externalId"].replace(EXTERNAL_ID_POST_FIX, ""))
    if sram_members != sorted(remote_members):
        return True
    if SCIM_SCHEMA_SRAM_GROUP in remote_group:
        if remote_group[SCIM_SCHEMA_SRAM_GROUP].get("description") != group.description:
            return True
        if remote_group[SCIM_SCHEMA_SRAM_GROUP].get("urn") != group.global_urn:
            return True

        labels = [t.tag_value for t in group.tags] if hasattr(group, "tags") else []
        if sorted(remote_group[SCIM_SCHEMA_SRAM_GROUP].get("labels", [])) != sorted(labels):
            return True
    return False


def _all_remote_scim_objects(service: Service, scim_type, scim_resources=[], start_index=1, ):
    url = f"{service.scim_url}/{scim_type}?startIndex={start_index}"
    response = requests.get(url, headers=scim_headers(service), timeout=10)
    if not validate_response(response, service, outside_user_context=True):
        return []
    scim_json = response.json()
    scim_resources = scim_resources + scim_json["Resources"]
    if scim_json["totalResults"] != len(scim_resources):
        # Preferably the SCIM server does not paginate, as this is not stateful and can lead to inconsistent results
        scim_resources = _all_remote_scim_objects(service, scim_type, scim_resources=scim_resources,
                                                  start_index=start_index + 1)
    return scim_resources


# Construct the members part of a group create / update
def _memberships(group: Union[Group, Collaboration], remote_users_by_external_id: dict):
    base_url = application_base_url()
    result = []
    active_members = [member for member in group.collaboration_memberships if member.is_active]
    for member in active_members:
        scim_object = remote_users_by_external_id[member.user.external_id]
        result.append(scim_member_object(base_url, member, scim_object))
    return result


def perform_sweep(service: Service):
    sync_results = {
        "users": {
            "deleted": [],
            "created": [],
            "updated": []
        },
        "groups": {
            "deleted": [],
            "created": [],
            "updated": []
        }
    }
    all_groups = all_scim_groups_by_service(service)
    all_users = all_scim_users_by_service(service)

    groups_by_identifier = {group.identifier: group for group in all_groups}
    users_by_external_id = {user.external_id: user for user in all_users}

    remote_scim_groups = _all_remote_scim_objects(service, SCIM_GROUPS)
    remote_scim_users = _all_remote_scim_objects(service, SCIM_USERS)

    # First delete all remote users and groups that are incorrectly in the remote SCIM database
    for remote_group in remote_scim_groups:
        if f"{remote_group['externalId'].replace(EXTERNAL_ID_POST_FIX, '')}" not in groups_by_identifier:
            url = f"{service.scim_url}{remote_group['meta']['location']}"
            response = requests.delete(url, headers=scim_headers(service, is_delete=True), timeout=10)
            if validate_response(response, service, outside_user_context=True):
                sync_results["groups"]["deleted"].append(url)

    for remote_user in remote_scim_users:
        if f"{remote_user['externalId'].replace(EXTERNAL_ID_POST_FIX, '')}" not in users_by_external_id:
            url = f"{service.scim_url}{remote_user['meta']['location']}"
            response = requests.delete(url, headers=scim_headers(service, is_delete=True), timeout=10)
            if validate_response(response, service, outside_user_context=True):
                sync_results["users"]["deleted"].append(url)

    remote_groups_by_external_id = {g["externalId"].replace(EXTERNAL_ID_POST_FIX, ""): g for g in remote_scim_groups}
    remote_users_by_external_id = {u["externalId"].replace(EXTERNAL_ID_POST_FIX, ""): u for u in remote_scim_users}

    for user in all_users:
        # A User with no memberships is deleted in the external SCIM database
        if not user.collaboration_memberships and service.sweep_remove_orphans:
            remote_user = remote_users_by_external_id.get(user.external_id)
            if remote_user:
                url = f"{service.scim_url}{remote_user['meta']['location']}"
                response = requests.delete(url, headers=scim_headers(service, is_delete=True), timeout=10)
                if validate_response(response, service, outside_user_context=True):
                    sync_results["groups"]["deleted"].append(url)
        # Add all SRAM users that are not present in the remote SCIM database
        elif user.external_id not in remote_users_by_external_id:
            scim_dict = create_user_template(user)
            url = f"{service.scim_url}/{SCIM_USERS}"
            scim_dict_cleansed = replace_none_values(scim_dict)
            response = requests.post(url, json=scim_dict_cleansed, headers=scim_headers(service),
                                     timeout=10)
            if validate_response(response, service, outside_user_context=True):
                # Add the new remote user to the remote_users_by_external_id for membership lookup
                response_json = response.json()
                remote_users_by_external_id[user.external_id] = response_json
                sync_results["users"]["created"].append(response_json)
        else:
            remote_user = remote_users_by_external_id[user.external_id]
            # Update SRAM users that are not equal to their counterpart in the remote SCIM database
            if _user_changed(user, remote_user):
                scim_dict = update_user_template(user, remote_user["id"])
                url = f"{service.scim_url}{remote_user['meta']['location']}"
                scim_dict_cleansed = replace_none_values(scim_dict)
                response = requests.put(url, json=scim_dict_cleansed, headers=scim_headers(service), timeout=10)
                if validate_response(response, service, outside_user_context=True):
                    response_json = response.json()
                    sync_results["users"]["updated"].append(response_json)

    for group in all_groups:
        membership_scim_objects = _memberships(group, remote_users_by_external_id)
        if not membership_scim_objects and service.sweep_remove_orphans:
            remote_group = remote_groups_by_external_id.get(group.identifier)
            if remote_group:
                url = f"{service.scim_url}{remote_group['meta']['location']}"
                response = requests.delete(url, headers=scim_headers(service, is_delete=True), timeout=10)
                if validate_response(response, service, outside_user_context=True):
                    sync_results["groups"]["deleted"].append(url)
        elif group.identifier not in remote_groups_by_external_id:
            scim_dict = create_group_template(group, membership_scim_objects)
            url = f"{service.scim_url}/{SCIM_GROUPS}"
            scim_dict_cleansed = replace_none_values(scim_dict)
            response = requests.post(url, json=scim_dict_cleansed, headers=scim_headers(service), timeout=10)
            if validate_response(response, service, outside_user_context=True):
                response_json = response.json()
                sync_results["groups"]["created"].append(response_json)
        else:
            remote_group = remote_groups_by_external_id[group.identifier]
            if _group_changed(group, remote_group, remote_scim_users):
                scim_dict = update_group_template(group, membership_scim_objects, remote_group["id"])
                url = f"{service.scim_url}{remote_group['meta']['location']}"
                scim_dict_cleansed = replace_none_values(scim_dict)
                response = requests.put(url, json=scim_dict_cleansed, headers=scim_headers(service), timeout=10)
                if validate_response(response, service, outside_user_context=True):
                    response_json = response.json()
                    sync_results["groups"]["updated"].append(response_json)

    return sync_results
