-- select all system configurations with job status
SELECT s.id, s.label, js2.label, js2.derivationJson, js2.logFilePath, js2.nixHash FROM systemConfiguration AS s LEFT JOIN ( SELECT j.id, js.label, j.objectId, j.derivationJson, j.logFilePath, j.nixHash FROM job AS j INNER JOIN jobStatus AS js ON j.statusId = js.id) AS js2 ON js2.objectId = s.id GROUP BY s.id;

-- select all test runs
SELECT j.id, t.label, js.label, s.label, j.logFilePath, t.resultsDirPath FROM testRun AS t, job AS j, jobStatus AS js, systemConfiguration AS s WHERE j.objectId = t.id AND j.statusId = js.id AND j.jobTypeId = t.jobTypeId AND t.systemConfigurationId = s.id;

-- select all jobs, with type label
SELECT j.id, jt.label, js.label, j.derivationJson, j.logFilePath FROM job AS j, jobType AS jt, jobStatus AS js WHERE j.jobTypeId = jt.id AND j.statusId = js.id;