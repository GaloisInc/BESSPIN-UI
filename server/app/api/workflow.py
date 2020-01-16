from flask import current_app, request
import json
from flask_restplus import Resource, fields

from . import api
from app.models import db, Workflow

"""
    Since all the routes here are for managing our Workflow 
    we set up a root namespace that is the prefix for all routes
    defined below
"""
ns = api.namespace(
    'workflow',
    description='Operations on workflows'
)

"""
    Define a swagger model that can be used for:
    - defining expected shape of inputs/outputs to the api
    - autogenerate swagger documentation for the structure of api data
"""
new_workflow = api.model('NewWorkflow', {
    'label': fields.String(
        required=True,
        description='Human-readable resource label'),
})

"""
    Extend the new workflow with the other optional fields that can be added
"""
existing_workflow = api.inherit(
    'ExistingWorkflow',
    new_workflow,
    {
        'workflowId': fields.Integer(
            required=True,
            description='Workflow identifier'),
        'sysConfigId': fields.Integer(
            required=False,
            description='SystemConfigurationInputs identifier'),
        'testRunId': fields.Integer(
            required=False,
            description='TestRunInputs identifier'),
        'reportJobId': fields.Integer(
            required=False,
            description='ReportJob identifier'),
    }
)


@ns.route('')
class WorkflowListApi(Resource):
    # by declaring which swagger model we use to marshal data,
    # flask will automagically convert any returned data to be
    # limited to that shape. This means that can effectively be
    # hidden by not including them in the definition
    @ns.marshal_list_with(existing_workflow)
    def get(self):
        current_app.logger.debug(f'fetching all workflows')
        return Workflow.query.all()

    # we can also declare the expected shape of input data to allow
    # for flask to validate that the correct data is supplied in a POST/PUT
    @ns.marshal_with(existing_workflow)
    @ns.expect(new_workflow, validate=True)
    def post(self):
        workflow_input = json.loads(request.data)
        new_workflow = Workflow(
            label=workflow_input['label'],
        )
        db.session.add(new_workflow)
        db.session.commit()

        return new_workflow


@ns.route('/<int:workflowId>')
class WorkflowApi(Resource):
    @ns.doc('update a workflow')
    @ns.marshal_list_with(existing_workflow)
    @ns.expect(new_workflow, validate=True)
    def put(self, workflowId):
        current_app.logger.debug(f'updating workflowId: {workflowId}')
        workflow_input = json.loads(request.data)
        existing_workflow = Workflow.query.get_or_404(workflowId)
        existing_workflow.label = workflow_input['label']

        if 'sysConfigId' in workflow_input:
            existing_workflow.sysConfigId = workflow_input['sysConfigId']
        if 'testConfigInd' in workflow_input:
            existing_workflow.testRunId = workflow_input['testRunId']
        if 'reportJobId' in workflow_input:
            existing_workflow.reportJobId = workflow_input['reportJobId']

        db.session.add(existing_workflow)
        db.session.commit()

        return existing_workflow

    @ns.doc('fetch a workflow')
    @ns.marshal_with(existing_workflow)
    def get(self, workflowId):
        current_app.logger.debug(f'fetching workflowId: {workflowId}')
        return Workflow.query.get_or_404(workflowId)
