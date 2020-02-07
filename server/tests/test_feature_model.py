import os
import unittest
import json
from uuid import uuid4

from app import create_app
from app.models import (
    db,
    FeatureModel,
)


FM_JSON_TEST_FILEPATH = os.path.join(os.path.dirname(__file__), '../app/ui/examples/flute.fm.json')


def load_test_fmjson() -> str:
    data = ''
    with open(FM_JSON_TEST_FILEPATH, 'r') as myfile:
        data = ''.join(myfile.readlines())
    return data


class FeatureModelTestCase(unittest.TestCase):

    def setUp(self):
        self.app = create_app('test')
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_minimum_viable_record(self):
        feature_model = FeatureModel(uid=str(uuid4()))

        db.session.add(feature_model)
        db.session.commit()

        self.assertEqual(len(FeatureModel.query.all()), 1)

    def test_record_with_conftree(self):
        uid = str(uuid4())
        source = load_test_fmjson()

        feature_model = FeatureModel(uid=uid, conftree=json.loads(source), filename='test.fm.json')

        db.session.add(feature_model)
        db.session.commit()

        fm = FeatureModel.query.get(uid)

        self.assertIsNotNone(fm)
        self.assertEqual(fm.conftree['version']['base'], 1)
