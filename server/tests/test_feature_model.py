import unittest
from uuid import uuid4

from app import create_app
from app.models import (
    db,
    FeatureModel,
)


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
