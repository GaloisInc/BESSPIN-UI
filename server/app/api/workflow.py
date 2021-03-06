from flask import current_app, request
import json
from flask_restplus import Resource, fields
from uuid import uuid4

from . import api
from app.models import (
    db,
    FeatureModel,
    SystemConfigurationInput,
    TestgenConfigInput,
    VulnerabilityConfigurationInput,
    Workflow
)
from app.api.system_configuration_inputs import existing_sysconfig_input
from app.api.testgen_config_input import existing_testgen_config_input
from app.api.vulnerability_configuration_inputs import existing_vulnconfig_input
from app.api.report_job import existing_report_job

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
        'createdAt': fields.String(
            required=False,
            description='Date workflow was initiallly created'),
        'updatedAt': fields.String(
            required=False,
            description='Date workflow was last updated'),
        'systemConfigurationInput': fields.Nested(
            existing_sysconfig_input,
            allow_null=True,
            required=False,
            description='SystemConfigurationInput associated with this workflow'),
        'testgenConfigInput': fields.Nested(
            existing_testgen_config_input,
            allow_null=True,
            required=False,
            description='TestgenConfigInput associated with this workflow'),
        'vulnerabilityConfigurationInput': fields.Nested(
            existing_vulnconfig_input,
            allow_null=True,
            required=False,
            description='VulnerabilityConfigurationInput associated with this workflow'
        ),
        'reportJobs': fields.List(fields.Nested(
            existing_report_job,
            allow_null=True,
            required=False,
            description='ReportJob associated with this workflow'
        ))
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
        """
            fetch all the current workflows
        """
        current_app.logger.debug(f'fetching all workflows')
        return Workflow.query.all()

    # we can also declare the expected shape of input data to allow
    # for flask to validate that the correct data is supplied in a POST/PUT
    @ns.marshal_with(existing_workflow)
    @ns.expect(new_workflow, validate=True)
    def post(self):
        """
            create a new workflow
        """
        workflow_input = json.loads(request.data)
        new_workflow = Workflow(
            label=workflow_input['label'],
        )
        db.session.add(new_workflow)
        db.session.commit()

        return new_workflow


@ns.route('/<int:workflowId>')
class WorkflowApi(Resource):
    @ns.marshal_list_with(existing_workflow)
    @ns.expect(new_workflow, validate=True)
    def put(self, workflowId):
        """
            update a workflow
        """
        current_app.logger.debug(f'updating workflowId: {workflowId}')
        workflow_input = json.loads(request.data)
        existing_workflow = Workflow.query.get_or_404(workflowId)
        existing_workflow.label = workflow_input['label']

        db.session.add(existing_workflow)
        db.session.commit()

        return existing_workflow

    @ns.marshal_with(existing_workflow)
    def get(self, workflowId):
        """
            fetch a workflow for the given workflowId
        """
        current_app.logger.debug(f'fetching workflowId: {workflowId}')
        workflow = Workflow.query.get_or_404(workflowId)

        return workflow


@ns.route('/clone/<int:workflowId>')
class WorkflowCloneApi(Resource):
    @ns.marshal_with(existing_workflow)
    def get(self, workflowId):
        """
            clone a workflow based on the Id passed in
        """
        current_app.logger.debug(f'cloning workflow({workflowId})')
        workflow = Workflow.query.get_or_404(workflowId)

        new_workflow = Workflow(label=f'COPY - {workflow.label}')
        db.session.add(new_workflow)
        db.session.commit()

        if workflow.systemConfigurationInput is not None:
            sysconfig = SystemConfigurationInput(
                label=f'COPY - {workflow.systemConfigurationInput.label}',
                nixConfigFilename=workflow.systemConfigurationInput.nixConfigFilename,
                nixConfig=workflow.systemConfigurationInput.nixConfig,
                workflowId=new_workflow.workflowId
            )
            db.session.add(sysconfig)

        if workflow.testgenConfigInput is not None:
            testgenconfig = TestgenConfigInput(
                label=f'COPY - {workflow.testgenConfigInput.label}',
                configInput=workflow.testgenConfigInput.configInput,
                workflowId=new_workflow.workflowId
            )
            db.session.add(testgenconfig)

        if workflow.vulnerabilityConfigurationInput is not None:
            existing_feat_model = workflow.vulnerabilityConfigurationInput.featureModel
            feat_model = FeatureModel(
                label=f'COPY - {existing_feat_model.label}',
                uid=str(uuid4()),  # TODO: the model should really handle UID generation so we don't have this duplication
                filename=existing_feat_model.filename,
                source=existing_feat_model.source,
                conftree=existing_feat_model.conftree,
                hash=existing_feat_model.hash,
                configs=existing_feat_model.configs
            )
            db.session.add(feat_model)

            vuln_config = VulnerabilityConfigurationInput(
                label=f'COPY - {workflow.vulnerabilityConfigurationInput.label}',
                vulnClass=workflow.vulnerabilityConfigurationInput.vulnClass,
                featureModelUid=feat_model.uid,
                workflowId=new_workflow.workflowId
            )
            db.session.add(vuln_config)

        db.session.commit()

        return new_workflow
