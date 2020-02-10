from helpers import BesspinTestBaseClass

from app.models import (
    db,
    JobStatus,
    ReportJob,
    SystemConfigurationInput,
)


class ReportJobsModelTestCase(BesspinTestBaseClass):

    def setUp(self):
        super(ReportJobsModelTestCase, self).setUp()
        JobStatus.load_allowed_statuses()

    def test_basic_functionality(self):

        db.session.add(
            SystemConfigurationInput(
                label='test sys-config 1',
                nixConfigFilename='foo.nix',
                nixConfig='{ test: { nix-config } }',
                workflowId=1
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
