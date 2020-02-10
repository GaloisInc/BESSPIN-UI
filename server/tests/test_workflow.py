from helpers import BesspinTestBaseClass

from app.models import (
    db,
    SystemConfigurationInput,
    Workflow,
)


class WorkFlowModelTestCase(BesspinTestBaseClass):

    def test_sysconfig_input(self):

        db.session.add(
            Workflow(
                label='test workflow',
            )
        )
        db.session.commit()
        test_workflow = Workflow.query.first()
        self.assertIsNotNone(test_workflow.workflowId)
        db.session.add(
            SystemConfigurationInput(
                label='test sysconfig',
                nixConfigFilename='test.nix',
                nixConfig='{ nix: config }',
                workflowId=test_workflow.workflowId
            )
        )
        db.session.commit()
        test_workflow = Workflow.query.first()
        self.assertEqual(test_workflow.systemConfigurationInput.label, 'test sysconfig')
