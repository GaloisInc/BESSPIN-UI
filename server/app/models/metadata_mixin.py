from datetime import datetime
from . import db


class MetaDataColumnsMixin(object):
    """
        Purpose: this is a model mixin to define meta-data columns common
                 to most tables
    """
    label = db.Column(
        db.String(128),
        default='',
        comment='user-defined label for usability'
    )
    createdAt = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )
    updatedAt = db.Column(
        db.DateTime,
        onupdate=datetime.utcnow
    )
