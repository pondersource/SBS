import datetime
import uuid
from unittest import TestCase

from server.db.domain import User
from server.scim.user_template import find_user_by_id_template


class TestUserTemplate(TestCase):

    def test_find_user_by_id_template(self):
        now = datetime.datetime.now()
        user = User(external_id=uuid.uuid4(), name="John Doe", email="jdoe@domain.com", updated_at=now, created_at=now)
        result = find_user_by_id_template(user)

        self.assertEqual(result["displayName"], user.name)
        self.assertEqual(result["name"]["familyName"], "")
