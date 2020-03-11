from helpers import (
    BesspinTestBaseClass,
    create_sysConfig,
    create_workflow,
)

from app.models import (
    SystemConfigurationInput,
)


class SystemConfigurationInputModelTestCase(BesspinTestBaseClass):

    def test_workflow_relationship(self):
        wf = create_workflow(label='wf')

        test_label = 'test sysconfig'
        create_sysConfig(
            label=test_label,
            nixConfigFilename='foo.nix',
            nixConfig='{ some: config }',
            workflowId=wf.workflowId
        )

        sc = SystemConfigurationInput.query.filter_by(label=test_label).first()

        self.assertIsNotNone(sc)
        self.assertIsNotNone(sc.workflow)
        self.assertEqual(sc.workflow.label, 'wf')
