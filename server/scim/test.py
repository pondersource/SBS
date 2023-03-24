import logging
import os
import urllib.parse
from functools import wraps
from time import sleep
from typing import Union, List

import requests

class User:
    def __init__(self, external_id):
        self.external_id = external_id
        self.name = external_id

class Member:
    def __init__(self, external_id):
        self.user = User(external_id)

def validate_response(response):
    if not response or response.status_code > 204:
        return False
    return True

def scim_member_object(base_url, membership: Member, scim_object=None):
    member_value = f"{membership.user.external_id}@sram.surf.nl"
    return {
        "value": scim_object["id"] if scim_object else member_value,
        "display": membership.user.name,
        "$ref": f"{base_url}/Users/{member_value}"
    }

# Do a lookup of the user or group in the external SCIM DB belonging to this service
def _lookup_scim_object(scim_type: str, external_id: str):
    query_filter = f"externalId eq \"{external_id}@sram.surf.nl\""
    url = f"https://cloud.pondersource.com/index.php/apps/federatedgroups/scim/{scim_type}?filter={urllib.parse.quote(query_filter)}"
    response = requests.get(url, headers=[], timeout=10)
    if not validate_response(response):
        return None
    scim_json = response.json()
    return None if scim_json["totalResults"] == 0 else scim_json["Resources"][0]



def membership_user_scim_objects():
    members = [
            Member('6fb746d9-afe0-4765-8667-ff5a91521414'),
            Member('2ff62896-87c8-42ce-96e9-7a8fd95ea523')
    ]
    base_url = "https://cloud.pondersource.com/index.php/apps/federatedgroups/scim"
        
    result = []
    for member in members:
        user = member.user
        scim_object = _lookup_scim_object("Users", user.external_id)
        if not scim_object:
            # We need to provision this user first as it is unknown in the remote SCIM DB
            response = _provision_user(scim_object, user)
            if validate_response(response):
                scim_object = response.json()
        if scim_object:
            result.append(scim_member_object(base_url, member, scim_object))
    return result


membership_user_scim_objects();
