from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()


from .versioned_resources import VersionedResource, VersionedResourceType  # noqa: E501, E402, F401
from .vulnerability_configuration_inputs import VulnerabilityConfigurationInput  # noqa: E501, E402, F401Y
from .feature_model_inputs import FeatureModelInput  # noqa: E501, E402, F401Y
from .feature_configuration_inputs import FeatureConfigurationInput  # noqa: E501, E402, F401Y
from .system_configuration_inputs import SystemConfigurationInput  # noqa: E501, E402, F401Y
from .testgen_config_input import TestgenConfigInput  # noqa: E501, E402, F401Y
from .test_run_inputs import TestRunInput  # noqa: E402, F401Y
from .jobs import Job, JobStatus, FeatureExtractionJob, ReportJob  # noqa: E501, E402, F401Y
from .workflows import Workflow  # noqa: E501, E402, F401Y
from .feature_models import FeatureModel  # noqa: E501, E402, F401Y
from .arch_extract import ArchExtract, ArchExtractOutput  # noqa: E501, E402, F401Y
from .cwe_scores import CweScore  # noqa: E501, E402, F401Y
