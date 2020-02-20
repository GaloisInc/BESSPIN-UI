from helpers import (
    BesspinTestBaseClass,
    create_sysConfig,
    create_workflow,
)
from sqlalchemy.exc import IntegrityError

from app.models import (
    db,
    SystemConfigurationInput,
)


class SystemConfigurationInputModelTestCase(BesspinTestBaseClass):

    def test_unique_constraint(self):
        wf = create_workflow(label='wf')

        db.session.add(
            SystemConfigurationInput(
                label='test sysconfig 1',
                nixConfigFilename='foo.nix',
                nixConfig='{ some: config }',
                workflowId=wf.workflowId
            )
        )
        db.session.add(
            SystemConfigurationInput(
                label='test sysconfig 2',
                nixConfigFilename='bar.nix',
                nixConfig='{ some: config }',
                workflowId=wf.workflowId
            )
        )

        with self.assertRaises(IntegrityError):
            db.session.commit()

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
