from helpers import (
    BesspinTestBaseClass,
    create_workflow,
    create_sysConfig,
    create_reportJob,
)

from app.models import (
    JobStatus,
    ReportJob,
    SystemConfigurationInput,
    Workflow,
)


class WorkFlowModelTestCase(BesspinTestBaseClass):

    def setUp(self):
        super(WorkFlowModelTestCase, self).setUp()
        JobStatus.load_allowed_statuses()

    def test_sysconfig_input(self):

        create_workflow(label='test workflow')
        test_workflow = Workflow.query.first()
        self.assertIsNotNone(test_workflow.workflowId)

        create_sysConfig(
            label='test sysconfig',
            nixConfigFilename='test.nix',
            nixConfig='{ nix: config }',
            workflowId=test_workflow.workflowId
        )
        self.assertIsNotNone(test_workflow.systemConfigurationInput)
        self.assertEqual(test_workflow.systemConfigurationInput.label, 'test sysconfig')

    def test_report_job(self):
        create_workflow(label='test workflow')
        test_workflow = Workflow.query.first()
        self.assertIsNotNone(test_workflow.workflowId)

        create_sysConfig(
            label='test sysconfig',
            nixConfigFilename='test.nix',
            nixConfig='{ nix: config }',
            workflowId=test_workflow.workflowId
        )
        test_sysconfig = SystemConfigurationInput.query.first()

        create_reportJob(
            label='first report',
            sysConfigId=test_sysconfig.sysConfigId,
            workflowId=test_workflow.workflowId,
            statusId=JobStatus().query.order_by(JobStatus.statusId.desc()).first().statusId
        )
        create_reportJob(
            label='second report',
            sysConfigId=test_sysconfig.sysConfigId,
            workflowId=test_workflow.workflowId,
            statusId=JobStatus().query.first().statusId
        )
        test_report_jobs = ReportJob.query.all()
        self.assertIsNotNone(test_report_jobs)
        self.assertEqual(len(test_report_jobs), 2, msg='Expected only two report jobs to exist')

        test_workflow = Workflow.query.first()
        self.assertEqual(len(test_workflow.reportJobs), 2, msg='Expected to be able to find two report jobs for our workflow')
        first_report = test_workflow.reportJobs[0]
        self.assertEqual(first_report.label, 'first report')
