from flask import current_app, request
import json
from flask_restplus import abort, Resource, fields
from datetime import datetime

from . import api
from app.models import db, SystemConfigurationInput, Workflow

"""
    Since all the routes here are for managing our SystemConfigurationInput
    we set up a root namespace that is the prefix for all routes
    defined below
"""
ns = api.namespace(
    'system-config-input',
    description='Operations on system configuration inputs'
)

"""
    Define a swagger model that can be used for:
    - defining expected shape of inputs/outputs to the api
    - autogenerate swagger documentation for the structure of api data
"""
new_sysconfig_input = api.model('NewSystemConfigurationInput', {
    'label': fields.String(
        required=True,
        description='Human-readable resource label'),
    'nixConfigFilename': fields.String(
        required=True,
        description='name of the uploaded nix config'),
    'nixConfig': fields.String(
        required=True,
        description='actual uploaded nix config'),
    'workflowId': fields.Integer(
        required=True,
        description='Id of workflow this instance should be associated with')
})

"""
    Extend the new system config input with the other optional fields that can be added
"""
existing_sysconfig_input = api.inherit(
    'ExistingSystemConfigurationInput',
    new_sysconfig_input,
    {
        'sysConfigId': fields.Integer(
            required=False,
            description='SystemConfigurationInputs identifier'),
        'createdAt': fields.String(
            required=False,
            description='Date system-configuration-input was initiallly created'),
        'updatedAt': fields.String(
            required=False,
            description='Date system-configuration-input was last updated'),
    }
)


@ns.route('')
class SystemConfigurationInputListApi(Resource):
    # by declaring which swagger model we use to marshal data,
    # flask will automagically convert any returned data to be
    # limited to that shape. This means that can effectively be
    # hidden by not including them in the definition
    @ns.marshal_list_with(existing_sysconfig_input)
    def get(self):
        current_app.logger.debug(f'fetching all system configuration inputs')
        return SystemConfigurationInput.query.all()

    # we can also declare the expected shape of input data to allow
    # for flask to validate that the correct data is supplied in a POST/PUT
    @ns.marshal_with(existing_sysconfig_input)
    @ns.expect(new_sysconfig_input, validate=True)
    def post(self):
        sysconfig_input = json.loads(request.data)
        workflow = Workflow.query.get(sysconfig_input['workflowId'])

        if workflow is None:
            return abort(400, 'Unable to find given workflow', workflowId=sysconfig_input['workflowId'])

        new_sysconfig_input = SystemConfigurationInput(
            label=sysconfig_input['label'],
            nixConfigFilename=sysconfig_input['nixConfigFilename'],
            nixConfig=sysconfig_input['nixConfig'],
            workflowId=workflow.workflowId
        )
        workflow.updatedAt = datetime.now()
        db.session.add(new_sysconfig_input)
        db.session.add(workflow)
        db.session.commit()

        return new_sysconfig_input


@ns.route('/<int:sysConfigInputId>')
class SystemConfigurationInputApi(Resource):
    @ns.doc('update a system configuration input')
    @ns.marshal_list_with(existing_sysconfig_input)
    @ns.expect(new_sysconfig_input, validate=True)
    def put(self, sysConfigInputId):
        current_app.logger.debug(f'updating sysConfigInputId: {sysConfigInputId}')
        sysconfig_input = json.loads(request.data)
        existing_sysconfig_input = SystemConfigurationInput.query.get_or_404(sysConfigInputId)

        if sysconfig_input['workflowId'] != existing_sysconfig_input.workflowId:
            current_app.logger.error(
                f'attempt to change workflow for sysconfig ({sysConfigInputId}) from ({existing_sysconfig_input.workflowId}) to ({sysconfig_input["workflowId"]})'  # noqa E501
            )
            return abort(400, 'Cannot change workflow association')

        existing_sysconfig_input.label = sysconfig_input['label']
        existing_sysconfig_input.nixConfig = sysconfig_input['nixConfig']
        existing_sysconfig_input.nixConfigFilename = sysconfig_input['nixConfigFilename']

        existing_sysconfig_input.workflow.updatedAt = datetime.now()
        db.session.add(existing_sysconfig_input)
        db.session.add(existing_sysconfig_input.workflow)
        db.session.commit()

        return existing_sysconfig_input

    @ns.doc('fetch a system configuration input')
    @ns.marshal_with(existing_sysconfig_input)
    def get(self, sysConfigInputId):
        current_app.logger.debug(f'fetching sysConfigInputId: {sysConfigInputId}')
        return SystemConfigurationInput.query.get_or_404(sysConfigInputId)
