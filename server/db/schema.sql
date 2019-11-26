CREATE TABLE IF NOT EXISTS hdl (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- just hope no one changes this on update...
	url TEXT NOT NULL UNIQUE -- assuming we will only be allowing users to point to HDL in a repos...
);

CREATE TABLE IF NOT EXISTS architectureModel (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- just hope no one changes this on update...
	hdlId INTEGER NOT NULL REFERENCES hdl (id) ON DELETE CASCADE, -- do we want to allow for this?
	nixHash TEXT UNIQUE, -- output of the nix build command to run the arch-extractor
	dotFilePath TEXT -- is this a nix path? should it be unique?
);

CREATE INDEX IF NOT EXISTS archModelNixHash ON architectureModel (nixHash);

CREATE TABLE IF NOT EXISTS featureModel (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- just hope no one changes this on update...
	hdlId INTEGER NOT NULL REFERENCES hdl (id) ON DELETE CASCADE, -- do we want to allow for this?
	nixHash TEXT UNIQUE, -- output of the nix build command to run the feat-extractor
	modelFilePath TEXT -- is this a nix path? should it be unique?
);

CREATE INDEX IF NOT EXISTS featModelNixHash ON featureModel (nixHash);

CREATE TABLE IF NOT EXISTS featureConfiguration (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- just hope no one changes this on update...
	featureModelId INTEGER NOT NULL REFERENCES featureModel (id) ON DELETE CASCADE, -- do we want to allow for this?
	nixHash TEXT UNIQUE, -- I think I might be confused about this: is it that the user is submitting a configuration that is generated outside of nix?
	configurationFilePath TEXT -- is this a nix path? should it be unique?
);

CREATE INDEX IF NOT EXISTS featConfigNixHash ON featureConfiguration (nixHash);

CREATE TABLE IF NOT EXISTS vulnerabilityConfiguration (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- just hope no one changes this on update...
	nixHash TEXT UNIQUE, -- I think I might be confused about this: is it that the user is submitting a configuration that is generated outside of nix?
	configurationFilePath TEXT -- is this a nix path? should it be unique ?
);

CREATE INDEX IF NOT EXISTS vulnConfigNixHash ON vulnerabilityConfiguration (nixHash);

CREATE TABLE IF NOT EXISTS systemConfiguration (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- just hope no one changes this on update...
	featureConfigurationId INTEGER REFERENCES featureConfiguration (id) ON DELETE SET NULL, -- if null, it implies they are using the configuration implicit in the HDL
	hdlId INTEGER REFERENCES hdl (id) ON DELETE SET NULL, -- I assume we need to point to the HDL in the case there is no feature configuration, but should it always be present?
	vulnerabilityConfigurationId INTEGER REFERENCES vulnerabilityConfiguration (id) ON DELETE SET NULL, -- assuming we want to be able to configure a system ahead of vulnerabilities
	customizationJson TEXT NOT NULL, -- SQLite does not have a JSON data-type but does have an extension to offer extension support for extracting JSON data in SELECTS (https://www.sqlite.org/json1.html)
	nixHash TEXT -- output of the nix build command to run system builder (having a value here means someone "kicked off a build")
);

CREATE INDEX IF NOT EXISTS sysConfigNixHash ON systemConfiguration (nixHash);
CREATE UNIQUE INDEX IF NOT EXISTS sysConfigUniqueNixHash ON systemConfiguration (nixHash) WHERE nixHash IS NOT NULL;

CREATE TABLE IF NOT EXISTS testRun (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT DEFAULT "", -- user-defined label for usability
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- just hope no one changes this on update...
	systemConfigurationId INTEGER NOT NULL UNIQUE REFERENCES systemConfiguration (id) ON DELETE CASCADE, -- do we want to allow deletions of system configurations?
	resultsDirPath TEXT UNIQUE -- I believe we'll have a directory where all the individual result logfiles will be placed
);

CREATE TABLE IF NOT EXISTS jobStatus (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT NOT NULL UNIQUE
);

-- this is my cheap "enum" hack (open to suggestions for better ways to do this)
INSERT OR IGNORE INTO jobStatus ("label") VALUES ("running");
INSERT OR IGNORE INTO jobStatus ("label") VALUES ("succeeded");
INSERT OR IGNORE INTO jobStatus ("label") VALUES ("failed");

CREATE TABLE IF NOT EXISTS job (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- just hope no one changes this on update...
	objectType TEXT NOT NULL, -- represents the type of job running (i.e. which object is nix building?)
	objectId INTEGER NOT NULL,
	nixHash TEXT, -- NOTE: we cannot enforce
	derivationJson TEXT,
	statusId INTEGER REFERENCES jobStatus (id),
	logFilePath TEXT UNIQUE -- I am assuming every job should have a unique logfile
);

CREATE INDEX IF NOT EXISTS jobNixHash ON job (nixHash);
CREATE UNIQUE INDEX IF NOT EXISTS jobNixUniqueHash ON job (nixHash) WHERE nixHash IS NOT NULL;

-- this was the best way I could figure out how to make sure we started out in "running" status if no status given
CREATE TRIGGER IF NOT EXISTS SetDefaultJobStatus AFTER INSERT ON job
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
