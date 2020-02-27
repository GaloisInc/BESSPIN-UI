import subprocess
from shlex import quote

from flask import current_app, request
import json
from flask_restplus import abort, Resource, fields

from config import config
from . import api
from app.models import (
    db,
    JobStatus,
    ReportJob,
    Workflow,
)

def make_testgen_command(cmd):
    """
    :param cmd: string of the command to run

    :return: list of parameters for subprocess to use
    """
    nix_cmd = "cd ~/testgen &&" + "nix-shell --run " + quote(cmd)
    return [ "su", "-", "besspinuser", "-c",
        nix_cmd
    ]


"""
    Since all the routes here are for managing our ReportJob
    we set up a root namespace that is the prefix for all routes
    defined below
"""
ns = api.namespace(
    'report-job',
    description='Operations on report jobs'
)

"""
    Define a swagger model that can be used for:
    - defining expected shape of inputs/outputs to the api
    - autogenerate swagger documentation for the structure of api data
"""
report_job_status = api.model('ReportJobStatus', {
    'label': fields.String(
        required=True,
        description='Human-readable report job label'),
    'statusId': fields.Integer(
        required=True,
        description='Id of job-status'),
})

new_report_job = api.model('NewReportJob', {
    'label': fields.String(
        required=True,
        description='Human-readable report-job label'),
    'workflowId': fields.Integer(
        required=True,
        description='Id of workflow record'),
})

"""
    since the only difference between a "new" report job and an existing one
    is the presence of a system-supplied ID, we inherit the "NewReportJob"
    for the definition of our "existing" one...
"""
existing_report_job = api.inherit(
    'ExistingReportJob',
    new_report_job,
    {
        'jobId': fields.Integer(
            required=True,
            description='Repport Job identifier'
        ),
        'createdAt': fields.String(
            required=False,
            description='Date report-job was initiallly created'),
        'updatedAt': fields.String(
            required=False,
            description='Date report-job was last updated'),
        'status': fields.Nested(
            report_job_status,
            required=True,
            description='status of the job',  # noqa E501
            skip_none=True
        ),
        'log': fields.String(
            required=False,
            description='contents of logging for given report'
        )
    }
)


@ns.route('')
class ReportJobListApi(Resource):
    # by declaring which swagger model we use to marshal data,
    # flask will automagically convert any returned data to be
    # limited to that shape. This means that can effectively be
    # hidden by not including them in the definition
    @ns.marshal_list_with(existing_report_job)
    def get(self):
        current_app.logger.debug(f'fetching all report jobs')
        return ReportJob.query.all()

    # we can also declare the expected shape of input data to allow
    # for flask to validate that the correct data is supplied in a POST/PUT
    @ns.marshal_with(existing_report_job)
    @ns.expect(new_report_job, validate=True)
    def post(self):
        report_job_input = json.loads(request.data)

        if Workflow.query.get(report_job_input['workflowId']) is None:
            return abort(400, 'Unable to find given workflow', workflowId=report_job_input['workflowId'])

        current_app.logger.debug(f'creating report job for workflow: {report_job_input["workflowId"]}')

        report_job_status = JobStatus.query.filter_by(label=JobStatus.INITIAL_STATUS).first()

        current_app.logger.debug(f'setting new report job status to: {report_job_status.label}')

        """
            INSERT NIX CALLS HERE...
        """
        cmd = make_testgen_command('./testgen.sh')

        if config['default'].USE_TOOLSUITE:
            cp = subprocess.run(
                cmd,
                capture_output=True
            )
            current_app.logger.debug('Clafer stdout: ' + str(cp.stdout.decode('utf8')))
            current_app.logger.debug('Clafer stderr: ' + str(cp.stderr.decode('utf8')))

        new_report_job = ReportJob(
            label=report_job_input['label'],
            statusId=report_job_status.statusId,
            workflowId=report_job_input['workflowId']
        )

        db.session.add(new_report_job)
        db.session.commit()

        return new_report_job


@ns.route('/<int:jobId>')
class ReportJobpi(Resource):
    @ns.doc('update a report job')
    @ns.marshal_list_with(existing_report_job)
    @ns.expect(existing_report_job, validate=True)
    def put(self, jobId):
        current_app.logger.debug(f'updating report jobId: {jobId}')

        existing_report_job = ReportJob.query.get_or_404(jobId)

        report_job_input = json.loads(request.data)

        job_status = JobStatus.query.get(report_job_input['status']['statusId'])

        if job_status is None:
            return abort(400, 'Unable to find specified job status', status=report_job_input['status'])

        if report_job_input['workflowId'] != existing_report_job.workflowId:
            current_app.logger.error(
                f'attempt to change workflow for report job ({jobId}) from ({existing_report_job.workflowId}) to ({report_job_input["workflowId"]})'  # noqa E501
            )
            return abort(400, 'Cannot change workflow association')

        existing_report_job.label = report_job_input['label']
        existing_report_job.statusId = job_status.statusId

        db.session.add(existing_report_job)
        db.session.commit()

        return existing_report_job

    @ns.doc('fetch a report job')
    @ns.marshal_with(existing_report_job)
    def get(self, jobId):
        current_app.logger.debug(f'fetching report jobId: {jobId}')
        return ReportJob.query.get_or_404(jobId)
