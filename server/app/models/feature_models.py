from . import db
from .metadata_mixin import MetaDataColumnsMixin


class FeatureModel(db.Model, MetaDataColumnsMixin):
    __tablename__ = 'feature_models'

    uid = db.Column(db.String(64), primary_key=True)
    filename = db.Column(db.Text())
    source = db.Column(db.Text(), default='', comment='Clafer source for feature model')
    conftree = db.Column(db.Text(), comment='sub-part of fmjson used in visualizing the source')
    hash = db.Column(db.Text(), comment='not used currently')
    configs = db.Column(db.Text(), default='[]', comment='list of clafer constraints')

    def __repr__(self):
        return f'<FeatureModel uid="{self.uid}" filename="{self.filename}">'  # noqa E501
