from helpers import (
    BesspinTestBaseClass,
    create_reportJob,
    create_sysConfig,
    create_workflow,
)

from app.models import (
    JobStatus,
    ReportJob,
)


class ReportJobsModelTestCase(BesspinTestBaseClass):

    def setUp(self):
        super(ReportJobsModelTestCase, self).setUp()
        JobStatus.load_allowed_statuses()

    def test_basic_functionality(self):

        wf = create_workflow(label='test workflow')
        sc = create_sysConfig(
            label='test sysconfig',
            workflowId=wf.workflowId,
            nixConfigFilename='test.nix',
            nixConfig='{nix: config}'
        )

        jobStatusId = JobStatus.query.filter_by(label='running').first().statusId

        self.assertIsNotNone(jobStatusId)

        create_reportJob(
            label='test report 1',
            sysConfigId=sc.sysConfigId,
            workflowId=wf.workflowId,
            statusId=jobStatusId
        )

        testReportJob = ReportJob.query.filter_by(sysConfigId=sc.sysConfigId).first()

        self.assertIsNotNone(testReportJob)
        self.assertEqual(testReportJob.status.label, 'running')
