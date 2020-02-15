import os
import unittest
import logging

from app import create_app
from app.models import db

DEFAULT_HEADERS = {'Content-type': 'application/json'}
FM_JSON_TEST_FILEPATH = os.path.join(os.path.dirname(__file__), '../../app/ui/examples/flute.fm.json')


def load_test_fmjson() -> str:
    data = ''
    with open(FM_JSON_TEST_FILEPATH, 'r') as myfile:
        data = ''.join(myfile.readlines())
    return data


class BesspinTestBaseClass(unittest.TestCase):

    def setUp(self):
        self.app = create_app('test')
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.app.logger.setLevel(logging.CRITICAL)
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
        self.app.logger.setLevel(logging.NOTSET)


class BesspinTestApiBaseClass(BesspinTestBaseClass):

    def setUp(self):
        super(BesspinTestApiBaseClass, self).setUp()
        self.client = self.app.test_client()
