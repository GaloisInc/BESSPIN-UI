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

CREATE TABLE IF NOT EXISTS architectureModelInputs (
	archModelId INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	hdlId INTEGER UNIQUE NOT NULL REFERENCES versionedResources (resourceId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS featureModelInputs (
	featModelId INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	hdlId INTEGER UNIQUE NOT NULL REFERENCES versionedResources (resourceId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS featureConfigurationInputs (
	featConfigId INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	featModelId INTEGER NOT NULL REFERENCES featureModelInputs (featModelId) ON DELETE CASCADE, -- can have many configurations for a model
	configurationJson TEXT, -- JSON generated during feature configuration
	CONSTRAINT uniqueFeatConfig UNIQUE (featModelId, configurationJson)
);

CREATE TABLE IF NOT EXISTS vulnerabilityConfigurationInputs (
	vulnConfigId INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	configuration TEXT UNIQUE -- text to contain actual configuration (NOTE: this may change to point to a file upload path if the text is too large)
);

CREATE TABLE IF NOT EXISTS systemConfigurationInputs (
	sysConfigId INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	featConfigId INTEGER REFERENCES featureConfigurationInputs (featConfigId) ON DELETE SET NULL, -- if null, it implies they are using the configuration implicit in the HDL
	hdlId INTEGER REFERENCES versionedResources (resourceId) ON DELETE SET NULL,
	osId INTEGER REFERENCES versionedResources (resourceId) ON DELETE SET NULL,
	toolChainId INTEGER REFERENCES versionedResources (resourceId) ON DELETE SET NULL,
	nixConfig TEXT, -- This column is our temporary one for the initial UI sys-config screen where we will simply provide a way to upload a nix config
	CONSTRAINT uniqueSystemConfig UNIQUE (featConfigId, hdlId, osId, toolChainId, nixConfig)
);

CREATE TABLE IF NOT EXISTS testRunInputs (
	testRunId INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	sysConfigId INTEGER NOT NULL REFERENCES systemConfigurationInputs (sysConfigId) ON DELETE SET NULL,
	vulnConfigId INTEGER REFERENCES vulnerabilityConfigurationInputs (vulnConfigId) ON DELETE SET NULL,
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
	derivationFilePath TEXT, -- path to *.drv file generated via "nix instantiate" for a given job
	statusId INTEGER NOT NULL REFERENCES jobStatus (statusId),
	nixStorePath TEXT, -- output of nix-build should be a path to the results in nix
	logFilePath TEXT UNIQUE -- output of command run
);

CREATE TABLE IF NOT EXISTS architectureExtractionJobs (
    jobId INTEGER PRIMARY KEY REFERENCES jobs(jobId),
    archModelId INTEGER NOT NULL REFERENCES architectureModelInputs(archModelId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS featureExtractionJobs (
    jobId INTEGER PRIMARY KEY REFERENCES jobs(jobId),
    featModelId INTEGER NOT NULL REFERENCES featureInputs(featModelId)
);

CREATE TABLE IF NOT EXISTS featureConfigurationJobs (
    jobId INTEGER PRIMARY KEY REFERENCES jobs(jobId),
    featConfigId INTEGER NOT NULL REFERENCES featureConfigurationInputs(featConfigId)
);

CREATE TABLE IF NOT EXISTS vulnerabilityConfigurationJobs (
    jobId INTEGER PRIMARY KEY REFERENCES jobs(jobId),
    vulnConfigId INTEGER NOT NULL REFERENCES vulnerabilityConfigurationInputs(vulnConfigId)
);

CREATE TABLE IF NOT EXISTS systemConfigurationJobs (
    jobId INTEGER PRIMARY KEY REFERENCES jobs(jobId),
    sysConfigId INTEGER NOT NULL REFERENCES systemConfigurations(sysConfigId)
);

CREATE TABLE IF NOT EXISTS testRunJobs (
    jobId INTEGER PRIMARY KEY REFERENCES jobs(jobId),
    testRunId INTEGER NOT NULL REFERENCES testRunInputs(testRunId)
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
