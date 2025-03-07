from flask import jsonify

from server.db.domain import Collaboration, Group, User
from server.test.abstract_test import AbstractTest
from server.test.seed import ai_researchers_group, ai_computing_name, ai_researchers_group_short_name, \
    service_group_mail_name, ai_dev_identifier, uuc_secret, john_name, uva_secret, collaboration_ai_computing_uuid


class TestGroup(AbstractTest):

    def test_group_name_exists(self):
        collaboration_id = self.find_entity_by_name(Collaboration, ai_computing_name).id

        res = self.get("/api/groups/name_exists",
                       query_data={"name": ai_researchers_group, "collaboration_id": collaboration_id})
        self.assertEqual(True, res)

        res = self.get("/api/groups/name_exists",
                       query_data={"name": "uuc", "existing_group": ai_researchers_group,
                                   "collaboration_id": collaboration_id})
        self.assertEqual(False, res)

        res = self.get("/api/groups/name_exists",
                       query_data={"name": "xyc", "collaboration_id": collaboration_id})
        self.assertEqual(False, res)

        res = self.get("/api/groups/name_exists",
                       query_data={"name": "xyc", "existing_group": "xyc",
                                   "collaboration_id": collaboration_id})
        self.assertEqual(False, res)

    def test_group_short_name_exists(self):
        collaboration_id = self.find_entity_by_name(Collaboration, ai_computing_name).id

        res = self.get("/api/groups/short_name_exists",
                       query_data={"short_name": ai_researchers_group_short_name,
                                   "collaboration_id": collaboration_id})
        self.assertEqual(True, res)

        res = self.get("/api/groups/short_name_exists",
                       query_data={"short_name": "uuc",
                                   "existing_group": ai_researchers_group_short_name,
                                   "collaboration_id": collaboration_id})
        self.assertEqual(False, res)

        res = self.get("/api/groups/short_name_exists",
                       query_data={"short_name": "xyc", "collaboration_id": collaboration_id})
        self.assertEqual(False, res)

        res = self.get("/api/groups/short_name_exists",
                       query_data={"short_name": "xyc", "existing_group": "xyc",
                                   "collaboration_id": collaboration_id})
        self.assertEqual(False, res)

    def test_save_group(self):
        self._do_test_save_group(False, 0, 0)

    def test_save_group_auto_provision_members(self):
        self._do_test_save_group(True, 1, 5)

    def _do_test_save_group(self, auto_provision_members, invitations_count, members_count):
        self.login("urn:john")
        collaboration_id = self.find_entity_by_name(Collaboration, ai_computing_name).id
        group_name = "new_auth_group"
        self.post("/api/groups/", body={
            "name": group_name,
            "short_name": group_name,
            "description": "des",
            "auto_provision_members": auto_provision_members,
            "collaboration_id": collaboration_id,
        })
        group = self.find_entity_by_name(Group, group_name)

        self.assertEqual("uuc:ai_computing:new_auth_group", group.global_urn)
        self.assertEqual(invitations_count, len(group.invitations))
        self.assertEqual(members_count, len(group.collaboration_memberships))

    def test_update_group(self):
        self._do_test_update_group(False, 0, 2)

    def test_update_group_auto_provision_members(self):
        self._do_test_update_group(True, 1, 5)
        # Idempotency
        self._do_test_update_group(True, 1, 5)

    def _do_test_update_group(self, auto_provision_members, invitations_count, members_count):
        self.login("urn:john")
        group = jsonify(self.find_entity_by_name(Group, ai_researchers_group)).json
        group["short_name"] = "new_short_name"
        group["auto_provision_members"] = auto_provision_members
        self.put("/api/groups/", body=group)

        group = self.find_entity_by_name(Group, ai_researchers_group)

        self.assertEqual("uuc:ai_computing:new_short_name", group.global_urn)
        self.assertEqual(group.auto_provision_members, auto_provision_members)
        self.assertEqual(invitations_count, len(group.invitations))
        self.assertEqual(members_count, len(group.collaboration_memberships))

    def test_delete_group(self):
        group_id = self.find_entity_by_name(Group, ai_researchers_group).id
        self.delete("/api/groups", primary_key=group_id)
        self.delete("/api/groups", primary_key=group_id, response_status_code=404)

    def test_create_group_duplicate(self):
        collaboration_id = self.find_entity_by_name(Collaboration, ai_computing_name).id
        name = "AI developers"
        short_name = "ai_dev"
        res = self.post("/api/groups/", body={
            "name": name,
            "short_name": "unique",
            "collaboration_id": collaboration_id,
        })
        self.assertEqual(0, len(res))

        res = self.post("/api/groups/", body={
            "name": "unique",
            "short_name": short_name,
            "collaboration_id": collaboration_id,
        })
        self.assertEqual(0, len(res))

    def test_update_service_group(self):
        self.login("urn:sarah")
        group_before_update = self.find_entity_by_name(Group, service_group_mail_name)
        group_before_update_json = jsonify(group_before_update).json
        self.assertEqual(0, len(group_before_update.collaboration_memberships))

        group_json = jsonify(group_before_update).json
        group_json["name"] = "changed_name"
        group_json["description"] = "changed_description"
        group_json["short_name"] = "changed_short_name"
        group_json["auto_provision_members"] = True
        self.put("/api/groups/", body=group_json, with_basic_auth=False)

        group = self.find_entity_by_name(Group, service_group_mail_name)

        self.assertTrue(group.auto_provision_members)
        self.assertEqual(group.short_name, group_before_update_json["short_name"])
        self.assertEqual(group.description, group_before_update_json["description"])
        self.assertEqual(group.global_urn, group_before_update_json["global_urn"])
        self.assertEqual(4, len(group.collaboration_memberships))

    def test_add_membership_api(self):
        self.assertIsNone(self.find_group_membership(ai_dev_identifier, "urn:jane"))

        self.post(f"/api/groups/v1/{ai_dev_identifier}",
                  body={"uid": "urn:jane"},
                  headers={"Authorization": f"Bearer {uuc_secret}"},
                  with_basic_auth=False)

        self.assertIsNotNone(self.find_group_membership(ai_dev_identifier, "urn:jane"))

    def test_add_membership_api_not_collaboration_member_forbidden(self):
        peter = self.find_entity_by_name(User, "Peter Doe")
        self.assertFalse(self.find_entity_by_name(Collaboration, ai_computing_name).is_member(peter.id))

        self.post(f"/api/groups/v1/{ai_dev_identifier}",
                  body={"uid": "urn:peter"},
                  headers={"Authorization": f"Bearer {uuc_secret}"},
                  response_status_code=409,
                  with_basic_auth=False)

    def test_add_membership_api_already_group_member_forbidden(self):
        john = self.find_entity_by_name(User, john_name)
        self.assertTrue(self.find_entity_by_name(Group, "AI developers").is_member(john.id))

        self.post(f"/api/groups/v1/{ai_dev_identifier}",
                  body={"uid": "urn:john"},
                  headers={"Authorization": f"Bearer {uuc_secret}"},
                  response_status_code=409,
                  with_basic_auth=False)

    def test_delete_membership_api(self):
        self.assertIsNotNone(self.find_group_membership(ai_dev_identifier, "urn:john"))

        self.delete(f"/api/groups/v1/{ai_dev_identifier}/members/urn:john",
                    headers={"Authorization": f"Bearer {uuc_secret}"},
                    with_basic_auth=False)

        self.assertIsNone(self.find_group_membership(ai_dev_identifier, "urn:john"))
        self.assertIsNotNone(self.find_collaboration_membership(collaboration_ai_computing_uuid, "urn:john"))

    def test_delete_membership_api_forbidden(self):
        self.delete(f"/api/groups/v1/{ai_dev_identifier}/members/urn:john",
                    headers={"Authorization": f"Bearer {uva_secret}"},
                    response_status_code=403,
                    with_basic_auth=False)
