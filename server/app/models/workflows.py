from . import db
from .metadata_mixin import MetaDataColumnsMixin


class Workflow(db.Model, MetaDataColumnsMixin):
    __tablename__ = 'workflows'

    workflowId = db.Column(db.Integer, primary_key=True)

    systemConfigurationInput = db.relationship('SystemConfigurationInput', uselist=False, backref='workflow')

    def __repr__(self):
        return f'<Workflow id="{self.workflowId}" label="{self.label}" updated="{self.updatedAt}">'  # noqa E501
