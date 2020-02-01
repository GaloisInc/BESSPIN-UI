import unittest
import logging
import os
import json

from app import create_app
from app.models import (
    db,
    FeatureModel,
)

DEAFAULT_HEADERS = {'Content-type': 'application/json'}
FM_JSON_TEST_FILEPATH = os.path.join(os.path.dirname(__file__), '../app/ui/examples/flute.fm.json')


def load_test_fmjson() -> str:
    data = ''
    with open(FM_JSON_TEST_FILEPATH, 'r') as myfile:
        data = ''.join(myfile.readlines())
    return data


class TestFeatureModelApi(unittest.TestCase):

    def setUp(self):
        self.app = create_app('test')
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.app.logger.setLevel(logging.CRITICAL)
        db.create_all()
        self.client = self.app.test_client()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
        self.app.logger.setLevel(logging.NOTSET)

    def test_upload_with_fmjson(self):
        r = FeatureModel().query.all()
        self.assertListEqual(r, [])

        test_filename = 'test.fm.json'
        upload_file = load_test_fmjson()

        response = self.client.post(
            f'/api/configurator/upload/{test_filename}/',
            headers=DEAFAULT_HEADERS,
            data=upload_file
        )

        self.assertEqual(response.status_code, 200, msg='expected post of new feature model to succeed')
        created_feat_model = FeatureModel.query.filter_by(filename=test_filename).first()
        self.assertIsNotNone(created_feat_model.conftree, msg='expected "conftree" to be populated')
        self.assertEqual(created_feat_model.filename, test_filename, msg='expected filename used in request URL to be stored in the feature model')

    def test_get_model(self):
        test_uid = 'TEST_UID'
        test_filename = 'test.fm.json'
        test_conftree = load_test_fmjson()

        fm = FeatureModel(
            uid=test_uid,
            filename=test_filename,
            conftree=test_conftree
        )

        db.session.add(fm)
        db.session.commit()

        response = self.client.post(
            '/api/configurator/load_from_db/',
            headers=DEAFAULT_HEADERS,
            data=json.dumps(dict(model_uid=test_uid))
        )

        self.assertEqual(response.status_code, 200, msg='expected success in request for feature_model')

        json_response = json.loads(response.data)

        self.assertEqual(json_response['uid'], test_uid, msg='expected to get the uid in the return')
        self.assertIsNotNone(json_response['conftree'], msg='expected "conftree" to be populated')

    def test_list_models(self):
        test_conftree = load_test_fmjson()
        test_uid_1 = 'TEST-UID-1'
        test_uid_2 = 'TEST-UID-2'

        fm1 = FeatureModel(
            uid=test_uid_1,
            filename='test1.fm.json',
            conftree=test_conftree
        )
        fm2 = FeatureModel(
            uid=test_uid_2,
            filename='test2.fm.json',
            conftree=test_conftree
        )

        db.session.add(fm1)
        db.session.add(fm2)
        db.session.commit()

        response = self.client.get(
            '/api/configurator/list_db_models/',
            headers=DEAFAULT_HEADERS
        )

        self.assertEqual(response.status_code, 200, msg='expected request for all models to succeed')
        
        models = json.loads(response.data)

        self.assertEqual(len(models), 2, msg='expected to get two models')
        self.assertEqual(models[0]['uid'], test_uid_2, msg='expected to get uid for second model we created')
        self.assertEqual(models[1]['uid'], test_uid_1, msg='expected to get uid for first model we created')