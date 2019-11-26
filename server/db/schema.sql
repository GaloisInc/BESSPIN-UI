-- enumeration of the types of jobs we support
CREATE TABLE IF NOT EXISTS jobType (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT UNIQUE NOT NULL
);

-- prepopulate our job types
INSERT OR IGNORE INTO jobType (label) VALUES ("architectureExtraction");
INSERT OR IGNORE INTO jobType (label) VALUES ("featureExtraction");
INSERT OR IGNORE INTO jobType (label) VALUES ("featureConfiguration");
INSERT OR IGNORE INTO jobType (label) VALUES ("systemConfiguration");
INSERT OR IGNORE INTO jobType (label) VALUES ("testRun");
INSERT OR IGNORE INTO jobType (label) VALUES ("vulnerabilityConfiguration"); -- QUESTION: are we running nix for vulnerability configuration?

CREATE TABLE IF NOT EXISTS hdl (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- just hope no one changes this on update...
	url TEXT NOT NULL UNIQUE -- assuming we will only be allowing users to point to HDL in a repos...
);

CREATE INDEX IF NOT EXISTS hdlUrlIdx ON hdl (url);

CREATE TABLE IF NOT EXISTS architectureModel (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	jobTypeId INTEGER REFERENCES jobType (id), -- should always point to "architectureExtraction" job-type (see "setArchModelJobTypeTrigger")
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	hdlId INTEGER NOT NULL REFERENCES hdl (id) ON DELETE CASCADE, -- QUESTION: do we want to allow users to delete HDL?
	nixHash TEXT UNIQUE, -- output of the nix build command to run the arch-extractor
	dotFilePath TEXT -- QUESTION: is this a nix path? should it be unique?
);

CREATE INDEX IF NOT EXISTS archExtractJobTypeIdx ON architectureModel (jobTypeId) WHERE jobTypeId IS NOT NULL;
CREATE INDEX IF NOT EXISTS archModelNixHashIdx ON architectureModel (nixHash);
CREATE TRIGGER IF NOT EXISTS setArchModelJobTypeTrigger AFTER INSERT ON architectureModel
FOR EACH ROW WHEN NEW.jobTypeId IS NULL
BEGIN 
	UPDATE architectureModel
SET jobTypeId = (SELECT id FROM jobType WHERE label = "architectureExtraction" LIMIT 1)
WHERE
	id = NEW.id;
END;

CREATE TABLE IF NOT EXISTS featureModel (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	jobTypeId INTEGER REFERENCES jobType (id), -- should always point to "featureExtraction" job-type (see "setFeatExtractJobTypeTrigger")
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- just hope no one changes this on update...
	hdlId INTEGER NOT NULL REFERENCES hdl (id) ON DELETE CASCADE, -- QUESTION: do we want to allow users to delete HDL?
	nixHash TEXT UNIQUE, -- output of the nix build command to run the feat-extractor
	modelFilePath TEXT -- QUESTION: is this a nix path? should it be unique?
);

CREATE INDEX IF NOT EXISTS featExtractJobTypeIdx ON featureModel (jobTypeId) WHERE jobTypeId IS NOT NULL;
CREATE INDEX IF NOT EXISTS featModelNixHashIdx ON featureModel (nixHash);
CREATE TRIGGER IF NOT EXISTS setFeatExtractJobTypeTrigger AFTER INSERT ON featureModel
FOR EACH ROW WHEN NEW.jobTypeId IS NULL
BEGIN 
	UPDATE featureModel
SET jobTypeId = (SELECT id FROM jobType WHERE label = "featureExtraction" LIMIT 1)
WHERE
	id = NEW.id;
END;

CREATE TABLE IF NOT EXISTS featureConfiguration (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	jobTypeId INTEGER REFERENCES jobType (id), -- should always point to "featureConfiguration" job-type (see "setFeatConfigJobTypeTrigger")
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- just hope no one changes this on update...
	featureModelId INTEGER NOT NULL REFERENCES featureModel (id) ON DELETE CASCADE, -- QUESTION: do we want to allow for this?
	nixHash TEXT UNIQUE, -- QUESTION: I think I might be confused about this: is it that the user is submitting a configuration that is generated outside of nix?
	configurationFilePath TEXT -- QUESTION: is this a nix path? should it be unique?
);

CREATE INDEX IF NOT EXISTS featConfigJobTypeIdx ON featureConfiguration (jobTypeId) WHERE jobTypeId IS NOT NULL;
CREATE INDEX IF NOT EXISTS featConfigNixHashIdx ON featureConfiguration (nixHash);
CREATE TRIGGER IF NOT EXISTS setFeatConfigJobTypeTrigger AFTER INSERT ON featureConfiguration
FOR EACH ROW WHEN NEW.jobTypeId IS NULL
BEGIN 
	UPDATE featureConfiguration
SET jobTypeId = (SELECT id FROM jobType WHERE label = "featureConfiguration" LIMIT 1)
WHERE
	id = NEW.id;
END;

CREATE TABLE IF NOT EXISTS vulnerabilityConfiguration (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	jobTypeId INTEGER REFERENCES jobType (id), -- should always point to "vulnerabilityConfiguration" job-type (see "setVulnConfigJobTypeTrigger")
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- just hope no one changes this on update...
	nixHash TEXT UNIQUE, -- QUESTION: I think I might be confused about this: is it that the user is submitting a configuration that is generated outside of nix?
	configurationFilePath TEXT -- QUESTION: is this a nix path? should it be unique ?
);

CREATE INDEX IF NOT EXISTS vulnConfigJobTypeIdx ON vulnerabilityConfiguration (jobTypeId) WHERE jobTypeId IS NOT NULL;
CREATE INDEX IF NOT EXISTS vulnConfigNixHashIdx ON vulnerabilityConfiguration (nixHash);
CREATE TRIGGER IF NOT EXISTS setVulnConfigJobTypeTrigger AFTER INSERT ON vulnerabilityConfiguration
FOR EACH ROW WHEN NEW.jobTypeId IS NULL
BEGIN 
	UPDATE vulnerabilityConfiguration
SET jobTypeId = (SELECT id FROM jobType WHERE label = "vulnerabilityConfiguration" LIMIT 1)
WHERE
	id = NEW.id;
END;

CREATE TABLE IF NOT EXISTS systemConfiguration (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	jobTypeId INTEGER REFERENCES jobType (id), -- should always point to "systemConfiguration" job-type (see "setSysConfigJobTypeTrigger")
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- just hope no one changes this on update...
	featureConfigurationId INTEGER REFERENCES featureConfiguration (id) ON DELETE SET NULL, -- if null, it implies they are using the configuration implicit in the HDL
	hdlId INTEGER REFERENCES hdl (id) ON DELETE SET NULL, -- QUESTION: I assume we need to point to the HDL in the case there is no feature configuration, but should it always be present?
	vulnerabilityConfigurationId INTEGER REFERENCES vulnerabilityConfiguration (id) ON DELETE SET NULL, -- QUESTION: assuming we want to be able to configure a system ahead of vulnerabilities
	customizationJson TEXT NOT NULL, -- SQLite does not have a JSON data-type but does have an extension to offer extension support for extracting JSON data in SELECTS (https://www.sqlite.org/json1.html)
	nixHash TEXT -- output of the nix build command to run system builder (having a value here means someone "kicked off a build")
);

CREATE INDEX IF NOT EXISTS sysConfigJobTypeIdx ON systemConfiguration (jobTypeId) WHERE jobTypeId IS NOT NULL;
CREATE INDEX IF NOT EXISTS sysConfigNixHashIdx ON systemConfiguration (nixHash);
CREATE UNIQUE INDEX IF NOT EXISTS sysConfigUniqueNixHashIdx ON systemConfiguration (nixHash) WHERE nixHash IS NOT NULL;
CREATE TRIGGER IF NOT EXISTS setSysConfigJobTypeTrigger AFTER INSERT ON systemConfiguration
FOR EACH ROW WHEN NEW.jobTypeId IS NULL
BEGIN 
	UPDATE systemConfiguration
SET jobTypeId = (SELECT id FROM jobType WHERE label = "systemConfiguration" LIMIT 1)
WHERE
	id = NEW.id;
END;

CREATE TABLE IF NOT EXISTS testRun (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	jobTypeId INTEGER REFERENCES jobType (id), -- should always point to "testRun" job-type (see "setTestRunJobTypeTrigger")
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- just hope no one changes this on update...
	systemConfigurationId INTEGER NOT NULL UNIQUE REFERENCES systemConfiguration (id) ON DELETE CASCADE, -- do we want to allow deletions of system configurations?
	resultsDirPath TEXT UNIQUE -- I believe we'll have a directory where all the individual result logfiles will be placed
);

CREATE INDEX IF NOT EXISTS testRunJobTypeIdx ON testRun (jobTypeId) WHERE jobTypeId IS NOT NULL;
CREATE TRIGGER IF NOT EXISTS setTestRunJobTypeTrigger AFTER INSERT ON testRun
FOR EACH ROW WHEN NEW.jobTypeId IS NULL
BEGIN 
	UPDATE testRun
SET jobTypeId = (SELECT id FROM jobType WHERE label = "testRun" LIMIT 1)
WHERE
	id = NEW.id;
END;

-- enumeration of the possible job statuses
CREATE TABLE IF NOT EXISTS jobStatus (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT NOT NULL UNIQUE
);

INSERT OR IGNORE INTO jobStatus ("label") VALUES ("running");
INSERT OR IGNORE INTO jobStatus ("label") VALUES ("succeeded");
INSERT OR IGNORE INTO jobStatus ("label") VALUES ("failed");

CREATE TABLE IF NOT EXISTS job (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- just hope no one changes this on update...
	jobTypeId INTEGER NOT NULL REFERENCES jobType (id),
	objectId INTEGER NOT NULL,
	nixHash TEXT,
	derivationJson TEXT,
	statusId INTEGER REFERENCES jobStatus (id), -- should default to "running" jobStatus (see "setDefaultJobStatusTrigger")
	logFilePath TEXT UNIQUE -- QUESTION: I am assuming every job should have a unique logfile
);

CREATE INDEX IF NOT EXISTS jobJobTypeIdx ON job (jobTypeId);
CREATE INDEX IF NOT EXISTS jobNixHashIdx ON job (nixHash);
CREATE UNIQUE INDEX IF NOT EXISTS jobNixUniqueHash ON job (nixHash) WHERE nixHash IS NOT NULL;
CREATE TRIGGER IF NOT EXISTS setDefaultJobStatusTrigger AFTER INSERT ON job
FOR EACH ROW WHEN NEW.statusId IS NULL
BEGIN 
	UPDATE job
SET statusId = (SELECT id FROM jobStatus WHERE label = "running" LIMIT 1)
WHERE
	id = NEW.id;
END;

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
