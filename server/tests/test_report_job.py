import unittest

from app import create_app
from app.models import (
    db,
    JobStatus,
    ReportJob,
    SystemConfigurationInput,
)


class ReportJobsModelTestCase(unittest.TestCase):

    def setUp(self):
        self.app = create_app('test')
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        JobStatus.load_allowed_statuses()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_basic_functionality(self):

        db.session.add(
            SystemConfigurationInput(
                label='test sys-config 1',
                nixConfig='{ test: { nix-config } }',
            )
        )

        db.session.commit()

        testSysConfigId = SystemConfigurationInput.query.first().sysConfigId

        self.assertIsNotNone(testSysConfigId)

        jobStatusId = JobStatus.query.filter_by(label='running').first().statusId

        self.assertIsNotNone(jobStatusId)

        db.session.add(
            ReportJob(
                label='test report 1',
                sysConfigId=testSysConfigId,
                statusId=jobStatusId
            )
        )

        db.session.commit()

        testReportJob = ReportJob.query.filter_by(sysConfigId=testSysConfigId).first()

        self.assertIsNotNone(testReportJob)
        self.assertEqual(testReportJob.status.label, 'running')
