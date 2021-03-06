import csv
import json
import os
import pwd
import stat
import sys
import tempfile

from flask import current_app, request
from flask_restplus import abort, Resource, fields

from config import config
from app.models import (
    db,
    CweScore,
    JobStatus,
    ReportJob,
    Workflow,
    VulnerabilityConfigurationInput,
    FeatureModel,
)
from app.lib.toolsuite_utils import (
    get_config_ini_template,
    set_variable,
    set_unique_vuln_class_to_constaints,
)
from app.lib.nix import run_nix_subprocess
from . import api


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

cwe_score = api.model('CweScore', {
    'scoreId': fields.Integer(
        required=True,
        description='Id of score record'),
    'cwe': fields.Integer(
        required=True,
        description='Number of given CWE'),
    'score': fields.String(
        required=True,
        description='score value for cwe'),
    'notes': fields.String(
        required=True,
        description='additional notes about given score'),
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
        ),
        'scores': fields.List(fields.Nested(cwe_score))
    }
)


def save_test_config(workflow: Workflow, constraints_path: str, testgen_config_path: str):
    if (workflow.testgenConfigInput):
        current_app.logger.debug('USE TESTGEN CONFIG INPUT FROM DB')

        testgen_config_text = workflow.testgenConfigInput.configInput
        testgen_config_text = set_variable(testgen_config_text, 'useFeatureModel', 'Yes')
        testgen_config_text = set_variable(testgen_config_text, 'backend', 'qemu')
        testgen_config_text = set_variable(testgen_config_text, 'featureModelConstraints', constraints_path)
    else:
        testgen_config_text = get_config_ini_template()

        current_app.logger.debug('USE TEMPLATE TESTGEN CONFIG INPUT: ' + str(testgen_config_text))

        testgen_config_text = set_variable(testgen_config_text, 'useFeatureModel', 'Yes')
        testgen_config_text = set_variable(testgen_config_text, 'backend', 'qemu')
        testgen_config_text = set_variable(testgen_config_text, 'featureModelConstraints', constraints_path)
        testgen_config_text = set_variable(testgen_config_text, 'nTests', '2')

    current_app.logger.debug(testgen_config_text)

    with open(testgen_config_path, 'w') as f:
        f.write(testgen_config_text)


def fetch_scores(score_path: str):
    current_app.logger.debug(f'Looking for scores in "{score_path}"')

    scores = []

    try:
        with open(score_path) as csvfile:
            score_reader = csv.reader(csvfile)
            for row in score_reader:
                current_app.logger.debug(f'row: {row}')
                score = {'cwe': int(row[0]), 'score': row[1], 'notes': ', '.join(row[3:])}
                current_app.logger.debug(f'score: {score}')
                scores.append(score)
    except FileNotFoundError:
        current_app.logger.error(f'Unable to find scores file: "{score_path}"')
    except:  # noqa E722
        current_app.logger.error(f'Unexpected error reading {score_path} "{sys.exc_info()[0]}"')

    return scores


def generate_test_constraints(work_dir: str, vulnerability: VulnerabilityConfigurationInput, vuln_feature_model: FeatureModel):
    constraints_path = os.path.join(work_dir, 'constraints_generated.cfr')
    current_app.logger.debug('Constraints PATH: ' + constraints_path)

    constraints_text = (
        set_unique_vuln_class_to_constaints(vulnerability.vulnClass) +
        vuln_feature_model.configs_pp
    )
    current_app.logger.debug('CONSTRAINTS_TXT: ' + constraints_text)

    with open(constraints_path, 'w') as f:
        f.write(constraints_text)

    return constraints_path


def generate_test_config(work_dir: str, constraints_path: str, workflow: Workflow):
    testgen_config_path = os.path.join(work_dir, 'config_generated.ini')
    current_app.logger.debug('CONFIG PATH: ' + testgen_config_path)

    save_test_config(workflow, constraints_path, testgen_config_path)

    # NOTE: Have to change the permissions and owner from root to besspinuser
    os.chmod(testgen_config_path, stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IROTH)
    besspinuser_uid = pwd.getpwnam('besspinuser').pw_uid
    besspinuser_gid = pwd.getpwnam('besspinuser').pw_gid
    os.chown(testgen_config_path, besspinuser_uid, besspinuser_gid)

    return testgen_config_path


def make_nix_call(workflow: Workflow, vulnerability: VulnerabilityConfigurationInput, vuln_feature_model: FeatureModel):
    if os.environ.get('BESSPIN_CONFIGURATOR_USE_TEMP_DIR'):
        WORK_DIR_OBJ = tempfile.TemporaryDirectory()
        WORK_DIR = WORK_DIR_OBJ.name
    else:
        WORK_DIR = tempfile.gettempdir()

    current_app.logger.debug('WORK_DIR: ' + WORK_DIR)

    constraints_path = generate_test_constraints(WORK_DIR, vulnerability, vuln_feature_model)
    testgen_config_path = generate_test_config(WORK_DIR, constraints_path, workflow)

    try:
        testgen_path = config['default'].TESTGEN_PATH
        cp = run_nix_subprocess(testgen_path, f'./testgen.sh {testgen_config_path} ; ./scripts/CI/ciJobDecision.py runOnPush')

        current_app.logger.debug('Testgen stdout: ' + str(cp.stdout.decode('utf8')))
        current_app.logger.debug('Testgen stderr: ' + str(cp.stderr.decode('utf8')))

        log_output = str(cp.stdout.decode('utf8'))

        current_app.logger.debug(f'testgen_path="{testgen_path}')
        score_path = os.path.join(testgen_path, 'workDir', config['default'].TESTGEN_VULN_DIR_MAP[vulnerability.vulnClass], 'scores.csv')
        scores = fetch_scores(score_path)
    except TypeError as err:
        current_app.logger.error(f'Unexpected error running nix: {err}')
    except:  # noqa E722
        current_app.logger.error(f'Unexpected error running nix: {sys.exc_info()[0]}')
        log_output = 'Exception occurred runing tests. Please check server logs for more information'
        scores = []

    return [log_output, scores]


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

        workflow = Workflow.query.get(report_job_input['workflowId'])
        if workflow is None:
            return abort(400, 'Unable to find given workflow', workflowId=report_job_input['workflowId'])

        current_app.logger.debug(f'creating report job for workflow: {report_job_input["workflowId"]}')

        report_job_status = JobStatus.query.filter_by(label=JobStatus.INITIAL_STATUS).first()
        current_app.logger.debug(f'setting new report job status to: {report_job_status.label}')

        vulnerability = VulnerabilityConfigurationInput.query.filter_by(workflowId=report_job_input['workflowId']).first()
        current_app.logger.debug(f'vulnerability class for report: {str(vulnerability.vulnClass)}')

        vuln_feature_model = FeatureModel.query.filter_by(uid=vulnerability.featureModelUid).first()
        current_app.logger.debug(f'feature model configs_pp: {str(vuln_feature_model.configs_pp)}')

        new_report_job = ReportJob(
            label=report_job_input['label'],
            statusId=report_job_status.statusId,
            workflowId=report_job_input['workflowId'],
        )
        db.session.add(new_report_job)
        db.session.commit()

        if config['default'].USE_TOOLSUITE:
            [log_output, scores] = make_nix_call(workflow, vulnerability, vuln_feature_model)
        else:
            log_output = 'TOOLSUITE_NEEDED'
            scores = []

        job_status_succeeded = JobStatus.query.filter_by(label=JobStatus.SUCCEEDED_STATUS).first()

        existing_report_job = ReportJob.query.get_or_404(new_report_job.jobId)
        existing_report_job.status = job_status_succeeded
        existing_report_job.log = log_output

        current_app.logger.debug(f'adding scores: {scores} to {existing_report_job}')
        for score in scores:
            cs = CweScore(
                reportJobId=existing_report_job.jobId,
                cwe=score['cwe'],
                score=score['score'],
                notes=score['notes']
            )
            db.session.add(cs)

        db.session.add(existing_report_job)
        db.session.commit()

        return existing_report_job


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
