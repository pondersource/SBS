from flask import Blueprint, current_app, jsonify, session

from server.api.base import json_endpoint
from server.auth.security import current_user_id
from server.db.domain import Aup
from server.db.models import save

aup_api = Blueprint("aup_api", __name__, url_prefix="/api/aup")


@aup_api.route("/info", methods=["GET"], strict_slashes=False)
@json_endpoint
def links():
    return {
        "url_aup_en": current_app.app_config.aup.url_aup_en,
        "url_aup_nl": current_app.app_config.aup.url_aup_nl,
        "version": str(current_app.app_config.aup.version),
    }, 200


@aup_api.route("/agree", methods=["POST"], strict_slashes=False)
@json_endpoint
def agreed_aup():
    user_id = current_user_id()
    version = str(current_app.app_config.aup.version)
    if Aup.query.filter(Aup.user_id == user_id, Aup.au_version == version).count() == 0:
        aup = Aup(au_version=version, user_id=user_id)
        save(Aup, custom_json=jsonify(aup).json, allow_child_cascades=False)
    session["user"] = {**session["user"], **{"user_accepted_aup": True}}
    location = session.get("original_destination", current_app.app_config.base_url)
    return {"location": location}, 201
