-- HDLs
INSERT INTO hdl (
    label,
    url
) VALUES (
    "test-hdl-one",
    "https://github.com/path/to/hdl/file/one"
);

INSERT INTO hdl (
    label,
    url
) VALUES (
    "test-hdl-two",
    "https://github.com/path/to/hdl/file/two"
);

INSERT INTO hdl (
    label,
    url
) VALUES (
    "test-hdl-three",
    "https://github.com/path/to/hdl/file/three"
);

INSERT INTO hdl ( -- example without label
    url
) VALUES (
    "https://github.com/path/to/hdl/file/four"
);

-- Architecture Models
INSERT INTO architectureModel (
    label,
    hdlId,
    nixHash,
    dotFilePath
) VALUES (
    "arch-model-one",
    (SELECT id FROM hdl WHERE label = "test-hdl-one" LIMIT 1),
    "SOME-REALLY-UNIQUE-HASH",
    "/some/path/to/dotFile.dot"
);

INSERT INTO architectureModel (
    label,
    hdlId,
    nixHash,
    dotFilePath
) VALUES (
    "arch-model-two",
    (SELECT id FROM hdl WHERE label = "test-hdl-two" LIMIT 1),
    "SOME-REALLY-UNIQUE-HASH2",
    "/some/other/path/to/dotFile.dot"
);

INSERT INTO architectureModel (
    label,
    hdlId
) VALUES (
    "arch-model-in-progress",
    (SELECT id FROM hdl WHERE label = "test-hdl-three" LIMIT 1)
);

INSERT INTO architectureModel ( -- minimum required data example
    hdlId
) VALUES (
    (SELECT id FROM hdl WHERE label = "test-hdl-three" LIMIT 1)
);

-- Feature Models
INSERT INTO featureModel (
    label,
    hdlId,
    nixHash,
    modelFilePath
) VALUES (
    "feat-model-one",
    (SELECT id FROM hdl WHERE label = "test-hdl-one" LIMIT 1),
    "SOME-REALLY-UNIQUE-HASH",
    "/some/path/to/model.json"
);

INSERT INTO featureModel (
    label,
    hdlId,
    nixHash,
    modelFilePath
) VALUES (
    "feat-model-two",
    (SELECT id FROM hdl WHERE label = "test-hdl-two" LIMIT 1),
    "SOME-REALLY-UNIQUE-HASH2",
    "/some/other/path/to/model.json"
);

INSERT INTO featureModel (
    label,
    hdlId
) VALUES (
    "feat-model-in-progress",
    (SELECT id FROM hdl WHERE label = "test-hdl-three" LIMIT 1)
);

INSERT INTO featureModel ( -- minimum required data example
    hdlId
) VALUES (
    (SELECT id FROM hdl WHERE label = "" LIMIT 1)
);

-- Feature Configurations
INSERT INTO featureConfiguration (
    label,
    featureModelId,
    nixHash,
    configurationFilePath
) VALUES (
    "feat-config-one",
    (SELECT id FROM featureModel WHERE label = "feat-model-one" LIMIT 1),
    "SOME-SUPER-UNIQUE-HASH",
    "/some/path/to/feat/config.json"
);

INSERT INTO featureConfiguration (
    label,
    featureModelId,
    nixHash,
    configurationFilePath
) VALUES (
    "feat-config-two",
    (SELECT id FROM featureModel WHERE label = "feat-model-two" LIMIT 1),
    "SOME-SUPER-UNIQUE-HASH2",
    "/some/other/path/to/feat/config.json"
);

INSERT INTO featureConfiguration (
    label,
    featureModelId
) VALUES (
    "feat-config-in-progress",
    (SELECT id FROM featureModel WHERE label = "feat-model-one" LIMIT 1)
);

INSERT INTO featureConfiguration ( -- minimum required data example
    featureModelId
) VALUES (
    (SELECT id FROM featureModel WHERE label = "" LIMIT 1)
);

-- Vulnerability Configurations
INSERT INTO vulnerabilityConfiguration (
    label,
    nixHash,
    configurationFilePath
) VALUES (
    "vuln-config-one",
    "SOME-UBER-UNIQUE-HASH",
    "/some/path/to/vuln/config.json"
);

INSERT INTO vulnerabilityConfiguration (
    label,
    nixHash,
    configurationFilePath
) VALUES (
    "vuln-config-two",
    "SOME-UBER-UNIQUE-HASH2",
    "/some/other/path/to/vuln/config.json"
);

INSERT INTO vulnerabilityConfiguration (
    label
) VALUES (
    "vuln-config-in-progress"
);

-- System Configurations
INSERT INTO systemConfiguration (
    label,
    featureConfigurationId,
    hdlId,
    vulnerabilityConfigurationId,
    customizationJson,
    nixHash
) VALUES (
    "system-config-one",
    (SELECT id FROM featureConfiguration WHERE label = "feat-config-one" LIMIT 1),
    (SELECT fm.hdlId FROM featureModel AS fm, featureConfiguration AS fc WHERE fc.featureModelId = fm.id AND fc.label = "feat-config-one" LIMIT 1),
    (SELECT id FROM vulnerabilityConfiguration WHERE label = "vuln-config-one" LIMIT 1),
    '{ "option": "choice" }',
    "SOME-UTTERLY-UNIQUE-HASH"
);

INSERT INTO systemConfiguration (
    label,
    featureConfigurationId,
    hdlId,
    vulnerabilityConfigurationId,
    customizationJson,
    nixHash
) VALUES (
    "system-config-two",
    (SELECT id FROM featureConfiguration WHERE label = "feat-config-two" LIMIT 1),
    (SELECT fm.hdlId FROM featureModel AS fm, featureConfiguration AS fc WHERE fc.featureModelId = fm.id AND fc.label = "feat-config-two" LIMIT 1),
    (SELECT id FROM vulnerabilityConfiguration WHERE label = "vuln-config-two" LIMIT 1),
    '{ "option": "different-choice" }',
    "SOME-UTTERLY-UNIQUE-HASH2"
);

INSERT INTO systemConfiguration (
    label,
    featureConfigurationId,
    hdlId,
    vulnerabilityConfigurationId,
    customizationJson,
    nixHash
) VALUES (
    "system-config-three",
    (SELECT id FROM featureConfiguration WHERE label = "feat-config-three" LIMIT 1),
    (SELECT fm.hdlId FROM featureModel AS fm, featureConfiguration AS fc WHERE fc.featureModelId = fm.id AND fc.label = "feat-config-three" LIMIT 1),
    (SELECT id FROM vulnerabilityConfiguration WHERE label = "vuln-config-two" LIMIT 1),
    '{ "option": "different-choice" }',
    "SOME-UTTERLY-UNIQUE-HASH3"
);

INSERT INTO systemConfiguration (
    label,
    featureConfigurationId,
    hdlId,
    vulnerabilityConfigurationId,
    customizationJson
) VALUES (
    "system-config-in-progress",
    (SELECT id FROM featureConfiguration WHERE label = "feat-config-three" LIMIT 1),
    (SELECT fm.hdlId FROM featureModel AS fm, featureConfiguration AS fc WHERE fc.featureModelId = fm.id AND fc.label = "feat-config-three" LIMIT 1),
    (SELECT id FROM vulnerabilityConfiguration WHERE label = "vuln-config-three" LIMIT 1),
    '{ "option": "yet-a-different-choice" }'
);

INSERT INTO systemConfiguration (
    label,
    customizationJson
) VALUES (
    "system-config-minimum-set-up",
    '{ "option": "and-yet-a-different-choice" }'
);

INSERT INTO systemConfiguration ( -- minium required data example
    customizationJson
) VALUES (
    '{ "option": "even-yet-a-different-choice" }'
);

-- Test Runs
INSERT INTO testRun (
    label,
    systemConfigurationId,
    resultsDirPath
) VALUES (
    "test-run-one",
    (SELECT id FROM systemConfiguration WHERE label = "system-config-one" LIMIT 1),
    "/path/to/test/results/directory"
);

INSERT INTO testRun (
    label,
    systemConfigurationId,
    resultsDirPath
) VALUES (
    "test-run-two",
    (SELECT id FROM systemConfiguration WHERE label = "system-config-two" LIMIT 1),
    "/another/path/to/test/results/directory"
);

INSERT INTO testRun (
    label,
    systemConfigurationId
) VALUES (
    "test-run-in-progress",
    (SELECT id FROM systemConfiguration WHERE label = "system-config-three" LIMIT 1)
);

INSERT INTO testRun ( -- minimum required data example
    systemConfigurationId
) VALUES (
    (SELECT id FROM systemConfiguration WHERE label = "" LIMIT 1)
);

-- Jobs
INSERT INTO job ( -- successful arch-extract job
    jobTypeId,
    objectId,
    nixHash,
    derivationJson,
    statusId,
    logFilePath
) VALUES (
    (SELECT id FROM jobType WHERE label = "architectureExtraction" LIMIT 1),
    (SELECT id FROM architectureModel WHERE label = "arch-model-one" LIMIT 1),
    "SOME-IMPROBABLY-UNIQUE-HASH",
    '{ "derivation": "value" }',
    (SELECT id FROM jobStatus WHERE label = "succeeded" LIMIT 1),
    "/some/path/to/log/file.log"
);

INSERT INTO job ( -- successful system configuration job
    jobTypeId,
    objectId,
    nixHash,
    derivationJson,
    statusId,
    logFilePath
) VALUES (
    (SELECT id FROM jobType WHERE label = "systemConfiguration" LIMIT 1),
    (SELECT id FROM systemConfiguration WHERE label = "system-config-one" LIMIT 1),
    "SOME-IMPROBABLY-UNIQUE-HASH2",
    '{ "derivation": "value2" }',
    (SELECT id FROM jobStatus WHERE label = "succeeded" LIMIT 1),
    "/some/other/path/to/log/file.log"
);

INSERT INTO job ( -- successful feat-extract job
    jobTypeId,
    objectId,
    nixHash,
    derivationJson,
    statusId,
    logFilePath
) VALUES (
    (SELECT id FROM jobType WHERE label = "featureExtraction" LIMIT 1),
    (SELECT id FROM featureModel WHERE label = "feat-model-one" LIMIT 1),
    "SOME-IMPROBABLY-UNIQUE-HASH3",
    '{ "derivation": "value3" }',
    (SELECT id FROM jobStatus WHERE label = "succeeded" LIMIT 1),
    "/some/different/path/to/log/file.log"
);

INSERT INTO job ( -- successful feature configuration job
    jobTypeId,
    objectId,
    nixHash,
    derivationJson,
    statusId,
    logFilePath
) VALUES (
    (SELECT id FROM jobType WHERE label = "featureConfiguration" LIMIT 1),
    (SELECT id FROM featureConfiguration WHERE label = "feat-config-one" LIMIT 1),
    "SOME-IMPROBABLY-UNIQUE-HASH4",
    '{ "derivation": "value4" }',
    (SELECT id FROM jobStatus WHERE label = "succeeded" LIMIT 1),
    "/some/even/different/path/to/log/file.log"
);

INSERT INTO job ( -- successful vulnerability model job
    jobTypeId,
    objectId,
    nixHash,
    derivationJson,
    statusId,
    logFilePath
) VALUES (
    (SELECT id FROM jobType WHERE label = "vulnerabilityConfiguration" LIMIT 1),
    (SELECT id FROM vulnerabilityConfiguration WHERE label = "vuln-config-one" LIMIT 1),
    "SOME-IMPROBABLY-UNIQUE-HASH5",
    '{ "derivation": "value5" }',
    (SELECT id FROM jobStatus WHERE label = "succeeded" LIMIT 1),
    "/some/even/more/different/path/to/log/file.log"
);

INSERT INTO job ( -- successful test run job
    jobTypeId,
    objectId,
    nixHash,
    derivationJson,
    statusId,
    logFilePath
) VALUES (
    (SELECT id FROM jobType WHERE label = "testRun" LIMIT 1),
    (SELECT id FROM testRun WHERE label = "test-run-one" LIMIT 1),
    "SOME-IMPROBABLY-UNIQUE-HASH6",
    '{ "derivation": "value6" }',
    (SELECT id FROM jobStatus WHERE label = "succeeded" LIMIT 1),
    "/some/what/more/different/path/to/log/file.log"
);

INSERT INTO job ( -- failed test run job
    jobTypeId,
    objectId,
    statusId,
    logFilePath
) VALUES (
    (SELECT id FROM jobType WHERE label = "testRun" LIMIT 1),
    (SELECT id FROM testRun WHERE label = "test-run-two" LIMIT 1),
    (SELECT id FROM jobStatus WHERE label = "failed" LIMIT 1),
    "/some/path/to/failed/jlog/file.log"
);

INSERT INTO job ( -- running system configuration job
    jobTypeId,
    objectId,
    nixHash,
    statusId
) VALUES (
    (SELECT id FROM jobType WHERE label = "systemConfiguration" LIMIT 1),
    (SELECT id FROM systemConfiguration WHERE label = "system-config-in-progress" LIMIT 1),
    "SOME-IMPROBABLY-UNIQUE-HASH7",
    (SELECT id FROM jobStatus WHERE label = "running" LIMIT 1)
);