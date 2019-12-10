CREATE TABLE IF NOT EXISTS versionedResourceType (
	resourceTypeId INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT UNIQUE NOT NULL -- enumeration of possible types of versioned resources
);

INSERT OR IGNORE INTO versionedResourceType (label) VALUES ("hdl");
INSERT OR IGNORE INTO versionedResourceType (label) VALUES ("os");
INSERT OR IGNORE INTO versionedResourceType (label) VALUES ("toolchain");

CREATE TABLE IF NOT EXISTS versionedResources (
	resourceId INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	resourceTypeId INTEGER REFERENCES versionedResourceType (resourceTypeId), -- points to enumeration of possible types of versioned resources
	url TEXT NOT NULL, -- most often, a Git repository URL
    version TEXT NOT NULL, -- most often a commit hash
    CONSTRAINT uniqueUrlVersion UNIQUE (url, version)
);

CREATE TABLE IF NOT EXISTS architectureModels (
	archModelId INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	hdlId INTEGER UNIQUE NOT NULL REFERENCES versionedResource (resourceId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS featureModels (
	featModelId INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	hdlId INTEGER UNIQUE NOT NULL REFERENCES versionedResource (resourceId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS featureConfigurations (
	featConfigId INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	featModelId INTEGER NOT NULL REFERENCES featureModel (featModelId) ON DELETE CASCADE, -- can have many configurations for a model
	configurationJson TEXT, -- JSON generated during feature configuration
	CONSTRAINT uniqueFeatConfig UNIQUE (featModelId, configurationJson)
);

CREATE TABLE IF NOT EXISTS vulnerabilityConfigurations (
	vulnConfigId INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	configuration TEXT UNIQUE -- QUESTION: I have this as a text blob to store the actual configuration, but will we have a job to parse this and generate a test-config artifact?
);

CREATE TABLE IF NOT EXISTS systemConfigurations (
	sysConfigId INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	featConfigId INTEGER REFERENCES featureConfiguration (featConfigId) ON DELETE SET NULL, -- if null, it implies they are using the configuration implicit in the HDL
	hdlId INTEGER REFERENCES versionedResource (resourceId) ON DELETE SET NULL, -- QUESTION: I assume we need to point to the HDL in the case there is no feature configuration, but should it always be present (i.e. if you delete the HDL, this row is meaningless)?
	osId INTEGER REFERENCES versionedResource (resourceId) ON DELETE SET NULL, -- QUESTION: same as above
	toolChainId INTEGER REFERENCES versionedResource (resourceId) ON DELETE SET NULL, -- QUESTION: same as above
	nixConfig TEXT, -- This column is our temporary one for the initial UI sys-config screen where we will simply provide a way to upload a nix config
	CONSTRAINT uniqueSystemConfig UNIQUE (featConfigId, hdlId, osId, toolChainId, nixConfig)
);

CREATE TABLE IF NOT EXISTS testRuns (
	testRunId INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	sysConfigId INTEGER NOT NULL REFERENCES systemConfiguration (sysConfigId) ON DELETE SET NULL, -- QUESTION: here, I am assuming we want to keep test results even if the system-config/vuln-config get deleted
	vulnConfigId INTEGER REFERENCES vulnerabilityConfiguration (vulnConfigId) ON DELETE SET NULL,
	CONSTRAINT uniqueTestRun UNIQUE (sysConfigId, vulnConfigId) -- there should be a 1:1 relationship between the test inputs and the run
);

-- enumeration of the possible job statuses
CREATE TABLE IF NOT EXISTS jobStatus (
	statusId INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT NOT NULL UNIQUE
);

INSERT OR IGNORE INTO jobStatus (label) VALUES ("running");
INSERT OR IGNORE INTO jobStatus (label) VALUES ("succeeded");
INSERT OR IGNORE INTO jobStatus (label) VALUES ("failed");

CREATE TABLE IF NOT EXISTS jobs (
	jobId INTEGER PRIMARY KEY AUTOINCREMENT,
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	derivationJson TEXT,
	statusId INTEGER NOT NULL REFERENCES jobStatus (statusId),
	nixStorePath TEXT, -- output of nix-build should be a path to the results in nix
	logFilePath TEXT UNIQUE -- output of command run
);

CREATE TABLE IF NOT EXISTS architectureExtractionJobs (
    jobId INTEGER PRIMARY KEY REFERENCES job(jobId),
    archModelId INTEGER NOT NULL REFERENCES architectureModel(archModelId) ON DELETE CASCADE -- QUESTION: should we remove all jobs when the object is deleted?
);

CREATE TABLE IF NOT EXISTS featureExtractionJobs (
    jobId INTEGER PRIMARY KEY REFERENCES job(jobId),
    featModelId INTEGER NOT NULL REFERENCES featureModel(featModelId)
);

CREATE TABLE IF NOT EXISTS featureConfigurationJobs (
    jobId INTEGER PRIMARY KEY REFERENCES job(jobId),
    featConfigId INTEGER NOT NULL REFERENCES featureConfiguration(featConfigId)
);

CREATE TABLE IF NOT EXISTS vulnerabilityConfigurationJobs (
    jobId INTEGER PRIMARY KEY REFERENCES job(jobId),
    vulnConfigId INTEGER NOT NULL REFERENCES vulnerabilityConfiguration(vulnConfigId)
);

CREATE TABLE IF NOT EXISTS systemConfigurationJobs (
    jobId INTEGER PRIMARY KEY REFERENCES job(jobId),
    sysConfigId INTEGER NOT NULL REFERENCES systemConfiguration(sysConfigId)
);

-- QUESTION: should test-runs be implicitly a part of system configuration?
CREATE TABLE IF NOT EXISTS testRunJobs (
    jobId INTEGER PRIMARY KEY REFERENCES job(jobId),
    testRunId INTEGER NOT NULL REFERENCES testRun(testRunId)
);

-- LEGACY SCHEMA (adding so we have it available until we are ready to convert to our new model)
CREATE TABLE IF NOT EXISTS feature_models (
    uid TEXT UNIQUE,
    filename TEXT,
    source TEXT,
    conftree TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    hash TEXT,
    configs TEXT,
    last_update DATETIME DEFAULT CURRENT_TIMESTAMP
);
