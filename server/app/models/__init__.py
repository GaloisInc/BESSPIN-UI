from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()


from .versioned_resources import VersionedResources, VersionedResourceTypes  # noqa: E501, E402, F401
from .vulnerability_configuration_inputs import VulnerabilityConfigurationInputs  # noqa: E501, E402, F401Y
from .feature_model_inputs import FeatureModelInputs  # noqa: E501, E402, F401Y
from .feature_configuration_inputs import FeatureConfigurationInputs  # noqa: E501, E402, F401Y
from .system_configuration_inputs import SystemConfigurationInputs  # noqa: E501, E402, F401Y
from .test_run_inputs import TestRunInputs  # noqa: E402, F401Y
from .jobs import Jobs, JobStatuses, FeatureExtractionJobs  # noqa: E501, E402, F401Y
