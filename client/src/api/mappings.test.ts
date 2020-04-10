import {
    mapWorkflow,
    mapWorkflows,
    IServersideReport,
    IServersideSysConfigInput,
    IServersideWorkflow,
    IServersideVulnConfigInput,
} from './mappings';
import {
    IWorkflow, JobStatus,
} from '../state/workflow';

describe('mappings', () => {

    describe('mapWorkflow', () => {
        const TEST_LABEL = 'test label';
        const TEST_CREATED_AT = '1234-56-78 00:00:00';
        
        describe('when contains minimal properties', () => {
            let testWorkflow: IServersideWorkflow;

            beforeEach(() => {
                testWorkflow = {
                    workflowId: 1,
                    createdAt: TEST_CREATED_AT,
                    label: TEST_LABEL,
                    reportJobs: [],
                };
            });

            it('should map into valid clientside workflow', () => {
                expect(mapWorkflow(testWorkflow)).toEqual({
                    id: 1,
                    label: TEST_LABEL,
                    createdAt: TEST_CREATED_AT,
                    reports: [],
                });
            });

            describe('and when it has updated datetime', () => {
                const TEST_UPDATED_AT = '8765-43-21 00:00:00';

                beforeEach(() => {
                    testWorkflow = {
                        workflowId: 1,
                        createdAt: TEST_CREATED_AT,
                        updatedAt: TEST_UPDATED_AT,
                        label: TEST_LABEL,
                        reportJobs: [],
                    };
                });

                it('should map into valid clientside workflow with an updated timestamp', () => {
                    expect(mapWorkflow(testWorkflow)).toEqual({
                        id: 1,
                        label: TEST_LABEL,
                        createdAt: TEST_CREATED_AT,
                        updatedAt: TEST_UPDATED_AT,
                        reports: [],
                    } as IWorkflow);
                });

                describe('and it also has a system configuration', () => {
                    const TEST_SYSCONFIG_LABEL = 'TEST SYSCONFIG';
                    const TEST_NIX_FILENAME = 'TEST.nix';
                    const TEST_NIX_CONFIG = '{ nix: "config" }';
                    const TEST_SYSCONFIG: IServersideSysConfigInput = {
                        sysConfigId: 2,
                        label: TEST_SYSCONFIG_LABEL,
                        createdAt: TEST_CREATED_AT,
                        workflowId: 1,
                        nixConfigFilename: TEST_NIX_FILENAME,
                        nixConfig: TEST_NIX_CONFIG,
                    };

                    beforeEach(() => {
                        testWorkflow = {
                            workflowId: 1,
                            createdAt: TEST_CREATED_AT,
                            updatedAt: TEST_UPDATED_AT,
                            label: TEST_LABEL,
                            reportJobs: [],
                            systemConfigurationInput: {
                                ...TEST_SYSCONFIG,
                            },
                        };
                    });

                    it('should map into valid clientside workflow with a system config', () => {
                        expect(mapWorkflow(testWorkflow)).toEqual({
                            id: 1,
                            label: TEST_LABEL,
                            createdAt: TEST_CREATED_AT,
                            updatedAt: TEST_UPDATED_AT,
                            reports: [],
                            systemConfig: {
                                id: TEST_SYSCONFIG.sysConfigId,
                                label: TEST_SYSCONFIG_LABEL,
                                createdAt: TEST_CREATED_AT,
                                nixFilename: TEST_NIX_FILENAME,
                                nixConfig: TEST_NIX_CONFIG,
                            },
                        } as IWorkflow);
                    });

                    describe('and it also has a vulnerability configuration', () => {
                        const TEST_VULN_CONFIG_LABEL = 'TEST VULN CONFIG';
                        const TEST_FEAT_MODEL = '{ feature: "model" }';
                        const TEST_VULN_CONFIG: IServersideVulnConfigInput = {
                            workflowId: 1,
                            vulnConfigId: 3,
                            createdAt: TEST_CREATED_AT,
                            updatedAt: TEST_UPDATED_AT,
                            label: TEST_VULN_CONFIG_LABEL,
                            featureModel: TEST_FEAT_MODEL,
                        };

                        beforeEach(() => {
                            testWorkflow = {
                                workflowId: 1,
                                createdAt: TEST_CREATED_AT,
                                updatedAt: TEST_UPDATED_AT,
                                label: TEST_LABEL,
                                reportJobs: [],
                                systemConfigurationInput: {
                                    ...TEST_SYSCONFIG,
                                },
                                vulnerabilityConfigurationInput: {
                                    ...TEST_VULN_CONFIG,
                                },
                            };
                        });

                        it('should map into valid clientside vulnerability config', () => {
                            expect(mapWorkflow(testWorkflow)).toEqual({
                                id: 1,
                                label: TEST_LABEL,
                                createdAt: TEST_CREATED_AT,
                                updatedAt: TEST_UPDATED_AT,
                                reports: [],
                                systemConfig: {
                                    id: TEST_SYSCONFIG.sysConfigId,
                                    label: TEST_SYSCONFIG_LABEL,
                                    createdAt: TEST_SYSCONFIG.createdAt,
                                    updatedAt: TEST_SYSCONFIG.updatedAt,
                                    nixFilename: TEST_SYSCONFIG.nixConfigFilename,
                                    nixConfig: TEST_SYSCONFIG.nixConfig,
                                },
                                testConfig: {
                                    id: TEST_VULN_CONFIG.vulnConfigId,
                                    createdAt: TEST_VULN_CONFIG.createdAt,
                                    updatedAt: TEST_VULN_CONFIG.updatedAt,
                                    label: TEST_VULN_CONFIG.label,
                                    featureModel: TEST_VULN_CONFIG.featureModel,
                                },
                            } as IWorkflow);
                        });

                        describe('and it also has a report job that is running', () => {
                            const TEST_REPORT_LABEL = 'TEST REPORT LABEL';
                            const TEST_REPORT: IServersideReport = {
                                jobId: 1,
                                createdAt: TEST_CREATED_AT,
                                updatedAt: TEST_UPDATED_AT,
                                label: TEST_REPORT_LABEL,
                                workflowId: 1,
                                status: {
                                    statusId: 1,
                                    label: 'running',
                                },
                                scores: [],
                            };

                            beforeEach(() => {
                                testWorkflow = {
                                    workflowId: 1,
                                    createdAt: TEST_CREATED_AT,
                                    updatedAt: TEST_UPDATED_AT,
                                    label: TEST_LABEL,
                                    systemConfigurationInput: {
                                        ...TEST_SYSCONFIG,
                                    },
                                    vulnerabilityConfigurationInput: {
                                        ...TEST_VULN_CONFIG,
                                    },
                                    reportJobs: [{
                                        ...TEST_REPORT,
                                    }],
                                };
                            });

                            it('should map into a valid clientside report', () => {
                                expect(mapWorkflow(testWorkflow)).toEqual({
                                    id: 1,
                                    createdAt: TEST_CREATED_AT,
                                    updatedAt: TEST_UPDATED_AT,
                                    label: TEST_LABEL,
                                    systemConfig: {
                                        id: TEST_SYSCONFIG.sysConfigId,
                                        label: TEST_SYSCONFIG_LABEL,
                                        createdAt: TEST_SYSCONFIG.createdAt,
                                        updatedAt: TEST_SYSCONFIG.updatedAt,
                                        nixFilename: TEST_SYSCONFIG.nixConfigFilename,
                                        nixConfig: TEST_SYSCONFIG.nixConfig,
                                    },
                                    testConfig: {
                                        id: TEST_VULN_CONFIG.vulnConfigId,
                                        createdAt: TEST_VULN_CONFIG.createdAt,
                                        updatedAt: TEST_VULN_CONFIG.updatedAt,
                                        label: TEST_VULN_CONFIG.label,
                                        featureModel: TEST_VULN_CONFIG.featureModel,
                                    },
                                    reports: [{
                                        id: TEST_REPORT.jobId,
                                        createdAt: TEST_REPORT.createdAt,
                                        updatedAt: TEST_REPORT.updatedAt,
                                        label: TEST_REPORT.label,
                                        status: JobStatus.Running,
                                        scores: [],
                                    }],
                                } as IWorkflow);
                            });

                            describe('and the report job succeeded', () => {
                                const TEST_REPORT_LOG = 'test log output';

                                beforeEach(() => {
                                    testWorkflow = {
                                        workflowId: 1,
                                        createdAt: TEST_CREATED_AT,
                                        updatedAt: TEST_UPDATED_AT,
                                        label: TEST_LABEL,
                                        systemConfigurationInput: {
                                            ...TEST_SYSCONFIG,
                                        },
                                        vulnerabilityConfigurationInput: {
                                            ...TEST_VULN_CONFIG,
                                        },
                                        reportJobs: [{
                                            ...TEST_REPORT,
                                            status: {
                                                statusId: 2,
                                                label: JobStatus.Succeeded,
                                            },
                                            log: TEST_REPORT_LOG,
                                            scores: [{ scoreId: 1, cwe: 123, score: 'V_HIGH', notes: ''}],
                                        }],
                                    };
                                });

                                it('should map to a client-side record with the appropriate status and log output', () => {
                                    expect(mapWorkflow(testWorkflow)).toEqual({
                                        id: 1,
                                        createdAt: TEST_CREATED_AT,
                                        updatedAt: TEST_UPDATED_AT,
                                        label: TEST_LABEL,
                                        systemConfig: {
                                            id: TEST_SYSCONFIG.sysConfigId,
                                            label: TEST_SYSCONFIG_LABEL,
                                            createdAt: TEST_SYSCONFIG.createdAt,
                                            updatedAt: TEST_SYSCONFIG.updatedAt,
                                            nixFilename: TEST_SYSCONFIG.nixConfigFilename,
                                            nixConfig: TEST_SYSCONFIG.nixConfig,
                                        },
                                        testConfig: {
                                            id: TEST_VULN_CONFIG.vulnConfigId,
                                            createdAt: TEST_VULN_CONFIG.createdAt,
                                            updatedAt: TEST_VULN_CONFIG.updatedAt,
                                            label: TEST_VULN_CONFIG.label,
                                            featureModel: TEST_VULN_CONFIG.featureModel,
                                        },
                                        reports: [{
                                            id: TEST_REPORT.jobId,
                                            createdAt: TEST_REPORT.createdAt,
                                            updatedAt: TEST_REPORT.updatedAt,
                                            label: TEST_REPORT.label,
                                            status: JobStatus.Succeeded,
                                            log: TEST_REPORT_LOG,
                                            scores: [
                                                { id: 1, cwe: 123, score: 'V_HIGH', notes: '' },
                                            ],
                                        }],
                                    } as IWorkflow);
                                });
                            });
                        });
                    });
                });
            });
        });

        // TODO: are the error messages coming from the API?
    });

    describe('mapWorkflows', () => {

        it('should simply pass thru the given workflow data', () => {
            const TEST_API_WORKFLOWS: IServersideWorkflow[] = [
                { workflowId: 1, label: 'w1', createdAt: 'SOME DATESTRING', reportJobs: [] },
                { workflowId: 2, label: 'w2', createdAt: 'SOME DATESTRING', reportJobs: [] },
            ];

            const TEST_CLIENT_WORKFLOWS: IWorkflow[] = [
                { id: 1, label: 'w1', createdAt: 'SOME DATESTRING', reports: [] },
                { id: 2, label: 'w2', createdAt: 'SOME DATESTRING', reports: [] },
            ];
            expect(mapWorkflows(TEST_API_WORKFLOWS)).toEqual(TEST_CLIENT_WORKFLOWS);
        })
    });
});
