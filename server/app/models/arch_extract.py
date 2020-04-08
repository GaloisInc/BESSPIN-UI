from . import db
from .metadata_mixin import MetaDataColumnsMixin


class ArchExtract(db.Model, MetaDataColumnsMixin):
    __tablename__ = 'arch_extract'

    archExtractId = db.Column(db.Integer, primary_key=True)

    archExtractInput = db.Column(
        db.Text(),
        nullable=True,
        comment=''
    )

    def __repr__(self):
        return f'<ArchExtract id="{self.archExtractId}">'  # noqa E501


class ArchExtractOutput(db.Model):
    __tablename__ = 'arch_extract_output'

    archExtractOutputId = db.Column(db.Integer, primary_key=True)
    archExtractOutputFilename = db.Column(db.String(128), nullable=True)
    archExtractId = db.Column(
        db.Integer,
        db.ForeignKey('arch_extract.archExtractId'),
        nullable=False,
        comment='can have many output for an architecture extraction'
    )
    archExtractOutputContent = db.Column(db.LargeBinary, nullable=True)
