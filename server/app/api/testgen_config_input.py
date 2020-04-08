from flask import current_app, request
import json
from flask_restplus import abort, Resource, fields
from datetime import datetime

from . import api
from app.models import db, TestgenConfigInput, Workflow

from app.lib.toolsuite_utils import (
    get_config_ini_template,
)

ns = api.namespace(
    'testgen-config-input',
    description='Operations on testgen config input'
)

from_client_testgen_submit_data = api.model('FromClientTestgenSubmitData', {
    'configInput': fields.String(
        required=True,
        description='Testgen config input text'),
})

existing_testgen_config_input = api.model('ExistingTestgenConfigInput', {
    'testgenConfigId': fields.Integer(
        required=True,
        description='Testgen config input identifier'),
    'workflowId': fields.Integer(
        required=True,
        description='Workflow identifier'),
    'label': fields.String(
        required=False,
        description='Testgen config input label'),
    'createdAt': fields.String(
        required=False,
        description='Date testgen config input was initiallly created'),
    'updatedAt': fields.String(
        required=False,
        description='Date testgen config input was last updated'),
    'configInput': fields.String(
        required=True,
        description='config input corresponding to some config.ini '),
})

@ns.route('/create/<string:workflowId>')
class CreateTestgenConfigInputApi(Resource):
    """
    Crerate a Testgen config input by adding an entry in the db
    and setting it up to the default one
    """
    @ns.marshal_list_with(existing_testgen_config_input)
    def get(self, workflowId):
        current_app.logger.debug(f'testgen config input: create {workflowId}')
        workflow = Workflow.query.get_or_404(workflowId)

        config_ini_template_file = get_config_ini_template()
        new_testgen_config_input = TestgenConfigInput(
            configInput=config_ini_template_file,
            workflowId=workflow.workflowId,
        )
        workflow.updatedAt = datetime.now()
        db.session.add(workflow)
        db.session.add(new_testgen_config_input)
        db.session.commit()

        return new_testgen_config_input


@ns.route('/submit/<string:workflowId>/<string:testgenConfigId>')
class SubmitTestgenConfigInputApi(Resource):
    # we can also declare the expected shape of input data to allow
    # for flask to validate that the correct data is supplied in a POST/PUT
    @ns.expect(from_client_testgen_submit_data, validate=True)
    @ns.marshal_list_with(existing_testgen_config_input)
    def post(self, workflowId, testgenConfigId):
        testgen_config_input = json.loads(request.data)
        current_app.logger.debug(f'testgen config input: submit: {testgen_config_input}')
        workflow = Workflow.query.get_or_404(workflowId)

        testgenConfig = TestgenConfigInput.query.get_or_404(testgenConfigId)
        testgenConfig.configInput = testgen_config_input['configInput']
        testgenConfig.updatedAt = datetime.now()

        workflow.updatedAt = datetime.now()
        db.session.add(testgenConfig)
        db.session.add(workflow)
        db.session.commit()

        return testgenConfig

@ns.route('/fetch/<string:workflowId>/<string:testgenConfigId>')
class FetchTestgenConfigInputApi(Resource):
    # we can also declare the expected shape of input data to allow
    # for flask to validate that the correct data is supplied in a POST/PUT
    @ns.marshal_list_with(existing_testgen_config_input)
    def get(self, workflowId, testgenConfigId):
        current_app.logger.debug(f'testgen config input: fetch')
        workflow = Workflow.query.get_or_404(workflowId) # this line is not necessary but cannot hurt
        testgenConfig = TestgenConfigInput.query.get_or_404(testgenConfigId)
        return testgenConfig
