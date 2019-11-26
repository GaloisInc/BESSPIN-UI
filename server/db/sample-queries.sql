-- select all architecture models
SELECT * FROM architectureModel;

-- select all feature models
SELECT * FROM featureModel;

-- select all feature configurations
SELECT * FROM featureConfiguration;

-- select all vulnerability configurations
SELECT * FROM vulnerabilityConfiguration;

-- select all systemConfigurations
SELECT * FROM systemConfiguration;

-- select all test runs
SELECT * FROM testRun;

-- select all jobs
SELECT * FROM job;

-- select all arch-extract jobs
-- SELECT j.id, js.label, s.label FROM job AS j, jobStatus AS js, systemConfiguration AS s ON j.statusId = js.id AND j.objectType = 'systemConfiguration' AND j.objectId = s.id;