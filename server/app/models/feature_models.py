import json
from sqlalchemy import Text
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.types import TypeDecorator
from . import db
from .metadata_mixin import MetaDataColumnsMixin
from app.lib.configurator_shim import (
    selected_features_to_constraints,
    combine_featmodel_cfgs,
)

"""
    Turns out that SqlAlchemy models are not good at deserializing JSON data
    Found this suggestion for using custom types and so implemented it:
    https://stackoverflow.com/questions/1378325/python-dicts-in-sqlalchemy/43587551
"""


class JsonDeserializer(TypeDecorator):
    impl = Text()

    def process_bind_param(self, value, dialect):
        if value is not None:
            value = json.dumps(value)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            value = json.loads(value)
        return value


class FeatureModel(db.Model, MetaDataColumnsMixin):
    __tablename__ = 'feature_models'

    uid = db.Column(db.String(64), primary_key=True)
    filename = db.Column(db.Text())
    source = db.Column(db.Text(), default='', comment='Clafer source for feature model')
    conftree = db.Column(JsonDeserializer(), comment='sub-part of fmjson used in visualizing the source')
    hash = db.Column(db.Text(), comment='not used currently')
    configs = db.Column(JsonDeserializer(), default=[], comment='list of clafer constraints')

    @hybrid_property
    def configs_pp(self):
        return selected_features_to_constraints(self.configs)

    @hybrid_property
    def server_constraints(self):
        return selected_features_to_constraints(self.configs)

    @hybrid_property
    def configured_feature_model(self):
        conftree = self.conftree or {'constraints': []}
        return combine_featmodel_cfgs(conftree, self.configs)

    tree = db.synonym('conftree')
    server_source = db.synonym('source')
    validated_features = db.synonym('configs')

    def __repr__(self):
        return f'<FeatureModel uid="{self.uid}" filename="{self.filename}">'  # noqa E501
