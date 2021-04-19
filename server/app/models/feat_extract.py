from . import db
from .metadata_mixin import MetaDataColumnsMixin


class FeatExtract(db.Model, MetaDataColumnsMixin):
    __tablename__ = 'feat_extract'

    featExtractId = db.Column(db.Integer, primary_key=True)

    featExtractInput = db.Column(
        db.Text(),
        nullable=True,
        comment=''
    )

    featExtractOutputFilename = db.Column(db.String(128), nullable=True)
    featExtractOutputContent = db.Column(db.String, nullable=True)
    featExtractOutputContentClafer = db.Column(db.String, nullable=True)
    featExtractOutputFilenameSimplified = db.Column(db.String(128), nullable=True)
    featExtractOutputContentSimplified = db.Column(db.String, nullable=True)
    featExtractOutputContentClaferSimplified = db.Column(db.String, nullable=True)

    def __repr__(self):
        return f'<FeatExtract id="{self.featExtractId}" input="{self.featExtractInput}">'  # noqa E501
