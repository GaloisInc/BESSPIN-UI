from helpers import BesspinTestBaseClass
import json
from uuid import uuid4

from app.models import (
    db,
    FeatureModel,
)
from helpers import (
    load_test_fmjson,
)


class FeatureModelTestCase(BesspinTestBaseClass):

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
