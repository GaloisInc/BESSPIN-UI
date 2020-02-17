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
        test_workflow = Workflow.query.first()
        self.assertIsNotNone(test_workflow.workflowId)
        )
        test_workflow = Workflow.query.first()
