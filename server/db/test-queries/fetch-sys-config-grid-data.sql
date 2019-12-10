-- query for system configuration data to display on main grid page
SELECT
	sc.sysConfigId,
	sc.label,
	sc.createdAt,
	sc.updatedAt,
	scj.label AS status,
	hdl.label AS hdlLabel,
	hdl.url AS hdlUrl,
	hdl.version AS hdlVersion,
	os.label AS osLabel,
	os.url AS oslUrl,
	os.version AS osVersion,
	tc.label AS tcLabel,
	tc.url AS tcUrl,
	tc.version AS tcVersion,
	scj.derivationJson,
	scj.logFilePath,
	scj.nixStorePath
FROM
	systemConfigurations sc
JOIN
	(
		SELECT
			sj.sysConfigId,
			jobs.createdAt,
			jobs.derivationJson,
			jobs.nixStorePath,
			jobs.logFilePath,
			js.label
		FROM
			jobs
		JOIN
			systemConfigurationJobs sj USING (jobId),
			jobStatus js USING (statusId)
		ORDER BY
			createdAt
		DESC
	) AS scj USING (sysConfigId),
	(
		SELECT
			v.resourceId,
			v.label,
			v.url,
			v.version,
			t.label AS resourceType
		FROM
			versionedResources v
		JOIN
			versionedResourceType t USING (resourceTypeId)
		WHERE
			t.label = "hdl"
	) AS hdl ON hdlId = hdl.resourceId,
	(
		SELECT
			v.resourceId,
			v.label,
			v.url,
			v.version,
			t.label AS resourceType
		FROM
			versionedResources v
		JOIN
			versionedResourceType t USING (resourceTypeId)
		WHERE
			t.label = "os"
	) AS os ON osId = os.resourceId,
	(
		SELECT
			v.resourceId,
			v.label,
			v.url,
			v.version,
			t.label AS resourceType
		FROM
			versionedResources v
		JOIN
			versionedResourceType t USING (resourceTypeId)
		WHERE
			t.label = "toolchain"
	) AS tc ON toolChainId = tc.resourceId