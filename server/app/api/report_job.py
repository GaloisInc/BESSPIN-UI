from flask import current_app, request
import json
from flask_restplus import Resource, fields

from . import api
from app.models import db, ReportJob, JobStatus

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
    'status': fields.Nested(
        report_job_status,
        required=True,
        description='status of the job',  # noqa E501
        skip_none=True
    )
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
        current_app.logger.debug(f'creating report job for workflow: {report_job_input["workflowId"]}')
        # TODO: should we even allow for a client to set the status?
        report_job_status = JobStatus.query.get(report_job_input['status']['statusId']) \
            or JobStatus.query.filter_by(label=JobStatus.ALLOWED_STATUSES[0]).first()

        current_app.logger.debug(f'setting new report job status to: {report_job_status.label}')

        """
            INSERT NIX CALLS HERE...
        """
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
        report_job_input = json.loads(request.data)
        job_status = JobStatus.query.get(report_job_input['status']['statusId'])
        existing_report_job = ReportJob.query.get_or_404(jobId)
        existing_report_job.label = report_job_input['label']
        existing_report_job.statusId = job_status.statusId
        db.session.add(existing_report_job)
        db.session.commit()

        return existing_report_job

    @ns.doc('fetch a report job')
    @ns.marshal_with(existing_report_job)
    def get(self, jobId):
        current_app.logger.debug(f'fetching report jobId: {jobId}')
        return ReportJob.query.get(jobId)
