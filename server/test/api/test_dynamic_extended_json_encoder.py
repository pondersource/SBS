import time
import uuid
from datetime import date

from flask import jsonify

from server.test.abstract_test import AbstractTest


class TestDynamicExtendedJSONEncoder(AbstractTest):

    def test_encoding(self):
        _uuid = uuid.uuid4()
        today = date.today()

        obj = {"1": _uuid, "2": today, "3": "default", "4": (1, 2)}
        res = jsonify(obj).json

        self.assertEqual(res["1"], str(_uuid))
        self.assertEqual(res["2"], time.mktime(today.timetuple()))
        self.assertEqual(res["3"], "default")
        self.assertListEqual(res["4"], [1, 2])
