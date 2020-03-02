from helpers import (
    BesspinTestApiBaseClass,
    create_featureModel,
    create_workflow,
    create_vulnerabilityConfig,
    DEFAULT_HEADERS,
    load_test_fmjson,
)

import json

from app.models import (
    FeatureModel,
    VulnerabilityConfigurationInput,
    Workflow,
)


class TestFeatureModelApi(BesspinTestApiBaseClass):

    def test_upload_with_fmjson(self):
        r = FeatureModel().query.all()
        self.assertListEqual(r, [])

        test_filename = 'test.fm.json'
        upload_file = load_test_fmjson()

        response = self.client.post(
            f'/api/feature-model/upload/{test_filename}/',
            headers=DEFAULT_HEADERS,
            data=upload_file
        )

        self.assertEqual(response.status_code, 200, msg='expected post of new feature model to succeed')

        response_json = json.loads(response.data)
        self.assertIsNotNone(response_json)
        self.assertEqual(response_json['tree'], json.loads(upload_file))

        created_feat_model = FeatureModel.query.filter_by(filename=test_filename).first()

        self.assertIsNotNone(created_feat_model.conftree, msg='expected "conftree" to be populated')
        self.assertEqual(created_feat_model.filename, test_filename, msg='expected filename used in request URL to be stored in the feature model')

    def test_get_model(self):
        test_uid = 'TEST_UID'
        test_filename = 'test.fm.json'
        test_conftree = load_test_fmjson()

        fm = create_featureModel(
            uid=test_uid,
            filename=test_filename,
            source=test_conftree,
            conftree=json.loads(test_conftree)
        )
        create_workflow(label='test workflow')

        wf = Workflow.query.filter_by(label='test workflow').first()
        self.assertIsNotNone(wf)
        fm = FeatureModel.query.filter_by(uid=test_uid).first()
        self.assertIsNotNone(fm)

        vc = create_vulnerabilityConfig(
            label='test vuln config',
            featureModelUid=test_uid,
            workflowId=wf.workflowId,
            vulnClass='BufferErrors'
        )

        vc = VulnerabilityConfigurationInput.query.filter_by(featureModelUid=test_uid).first()
        self.assertIsNotNone(vc)

        response = self.client.post(
            '/api/feature-model/fetch-by-uid',
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(model_uid=test_uid))
        )

        self.assertEqual(response.status_code, 200, msg='expected success in request for feature_model')

        json_response = json.loads(response.data)

        self.assertEqual(json_response['uid'], test_uid, msg='expected to get the uid in the return')
        self.assertIsNotNone(json_response['conftree'], msg='expected "conftree" to be populated')
        self.assertDictEqual(json_response['conftree'], json.loads(test_conftree), msg='expected "conftree" to be fully hydrated')

    def test_list_models(self):
        test_fmjson = load_test_fmjson()
        test_uid_1 = 'TEST-UID-1'
        test_uid_2 = 'TEST-UID-2'

        create_featureModel(
            uid=test_uid_1,
            filename='test1.fm.json',
            source=test_fmjson,
            conftree=json.loads(test_fmjson)
        )
        create_featureModel(
            uid=test_uid_2,
            filename='test2.fm.json',
            source=test_fmjson,
            conftree=json.loads(test_fmjson)
        )

        response = self.client.get(
            '/api/feature-model',
            headers=DEFAULT_HEADERS
        )

        self.assertEqual(response.status_code, 200, msg='expected request for all models to succeed')

        models = json.loads(response.data)

        self.assertEqual(len(models), 2, msg='expected to get two models')
        self.assertEqual(models[0]['uid'], test_uid_2, msg='expected to get uid for second model we created')
        self.assertEqual(models[1]['uid'], test_uid_1, msg='expected to get uid for first model we created')