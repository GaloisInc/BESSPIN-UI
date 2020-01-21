from flask import current_app, request
import json
from flask_restplus import Resource, fields

from . import api
from app.models import db, SystemConfigurationInput

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
            description='Date workflow was initiallly created'),
        'updatedAt': fields.String(
            required=False,
            description='Date workflow was last updated'),
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
        new_sysconfig_input = SystemConfigurationInput(
            label=sysconfig_input['label'],
            nixConfigFilename=sysconfig_input['nixConfigFilename'],
            nixConfig=sysconfig_input['nixConfig'],
            workflowId=sysconfig_input['workflowId']
        )
        db.session.add(new_sysconfig_input)
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
        existing_sysconfig_input.label = sysconfig_input['label']

        db.session.add(existing_sysconfig_input)
        db.session.commit()

        return existing_sysconfig_input

    @ns.doc('fetch a system configuration input')
    @ns.marshal_with(existing_sysconfig_input)
    def get(self, sysConfigInputId):
        current_app.logger.debug(f'fetching sysConfigInputId: {sysConfigInputId}')
        return SystemConfigurationInput.query.get_or_404(sysConfigInputId)
