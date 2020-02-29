import os
import stat
import pwd
import subprocess
from shlex import quote
import tempfile

import json
from flask import current_app, request
from flask_restplus import abort, Resource, fields

from config import config
from app.models import (
    db,
    JobStatus,
    ReportJob,
    Workflow,
)
from app.lib.testgen_utils import (
    get_config_ini_template,
    set_variable,
)
from . import api

def make_testgen_command(cmd):
    """
    :param cmd: string of the command to run

    :return: list of parameters for subprocess to use
    """
    nix_cmd = "cd ~/testgen &&" + "nix-shell --run " + quote(cmd)
    return ["su", "-", "besspinuser", "-c", nix_cmd]


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

        if config['default'].USE_TOOLSUITE:
            if os.environ.get('BESSPIN_CONFIGURATOR_USE_TEMP_DIR'):
                WORK_DIR_OBJ = tempfile.TemporaryDirectory()
                WORK_DIR = WORK_DIR_OBJ.name
            else:
                WORK_DIR = tempfile.gettempdir()

            current_app.logger.debug('WORK_DIR: ' + WORK_DIR)

            constraints_path = os.path.join(WORK_DIR, 'constraints_generated.cfr')
            current_app.logger.debug('Constraints PATH: '+ constraints_path)

            testgen_config_path = os.path.join(WORK_DIR, 'config_generated.ini')
            current_app.logger.debug('CONFIG PATH: '+ testgen_config_path)

            testgen_config_text = get_config_ini_template()
            current_app.logger.debug('TEMPLATE: ' + str(testgen_config_text))

            testgen_config_text = set_variable(testgen_config_text, 'vulClasses', '[bufferErrors]')
            testgen_config_text = set_variable(testgen_config_text, 'useFeatureModel', 'Yes')
            testgen_config_text = set_variable(testgen_config_text, 'backend', 'qemu')
            testgen_config_text = set_variable(testgen_config_text, 'featureModelConstraints', constraints_path)
            testgen_config_text = set_variable(testgen_config_text, 'nTests', '2')
            current_app.logger.debug(testgen_config_text)

            with open(testgen_config_path, 'w') as f:
                f.write(testgen_config_text)

            # NOTE: Have to change the permissions and owner from root to besspinuser
            os.chmod(testgen_config_path, stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IROTH)
            besspinuser_uid = pwd.getpwnam('besspinuser').pw_uid
            besspinuser_gid = pwd.getpwnam('besspinuser').pw_gid
            os.chown(testgen_config_path, besspinuser_uid, besspinuser_gid)

            with open(constraints_path, 'w') as f:
                f.write(
                    "[ BufferErrors_Weakness.Location.Location_Stack => BufferErrors_Weakness.Access.Access_Read]\n" +
                    "[ BufferErrors_Weakness.Location.Location_Heap => BufferErrors_Weakness.Access.Access_Write]\n" +
                    "[ !PPAC_test ]\n" +
                    "[ !InformationLeakage_Test ]\n" +
                    "[ !ResourceManagement_Test ]\n"
                    "[ !NumericErrors_Test ]\n"
                )
            # NOTE: Have to change the permissions and owner from root to besspinuser
            os.chmod(constraints_path, stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IROTH)
            os.chown(constraints_path, besspinuser_uid, besspinuser_gid)

            cmd = make_testgen_command('./testgen.sh '+ testgen_config_path)
            cp = subprocess.run(
                cmd,
                capture_output=True
            )
            current_app.logger.debug('Clafer stdout: ' + str(cp.stdout.decode('utf8')))
            current_app.logger.debug('Clafer stderr: ' + str(cp.stderr.decode('utf8')))
            log_output = str(cp.stdout.decode('utf8'))
        else:
            log_output = 'TOOLSUITE_NEEDED'

        new_report_job = ReportJob(
            label=report_job_input['label'],
            statusId=report_job_status.statusId,
            workflowId=report_job_input['workflowId'],
            log=log_output,
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
