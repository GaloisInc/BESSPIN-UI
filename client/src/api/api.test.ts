import {
    fetchConfigurators,
    fetchWorkflows,
    submitConfigurator,
    submitWorkflow,
} from './api';

import axios from 'axios';
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('api', () => {

    describe('fetchConfigurators', () => {

        describe('happy path', () => {
            const TEST_DATA = {
                foo: 'bar',
            };

            beforeEach(() => {
                mockedAxios.request.mockImplementation(() => {
                    return Promise.resolve({ data: { ...TEST_DATA }});
                });
            });

            it('should give us the actual data taken out of the response', (done) => {
                fetchConfigurators()
                    .then(data => {
                        expect(data).toEqual(TEST_DATA);
                        done();
                    })
                    .catch(done);
            });
        });

        describe('error cases', () => {

            describe('exception raised', () => {
                const TEST_EXCEPTION = new Error('TEST ERROR');

                beforeEach(() => {
                    mockedAxios.request.mockImplementation(() => {
                        return Promise.reject(TEST_EXCEPTION);
                    });
                });
                
                it('should just be an exception we catch', (done) => {
                    fetchConfigurators()
                        .then(() => done('should have triggered catch block'))
                        .catch(e => {
                            expect(e.message).toEqual(TEST_EXCEPTION.message);
                            done();
                        });
                });
            });

            describe('service returns HTML (indicating something went wrong', () => {

                beforeEach(() => {
                    mockedAxios.request.mockImplementation(() => {
                        return Promise.resolve({
                            headers: {
                                'Content-type': 'text/html',
                            },
                            data: '<html><head></head><body>ERROR</body></html>',
                        });
                    });
                });

                it('should raise an exception for us to catch', (done) => {
                    fetchConfigurators()
                        .then(() => done('should have triggered catch block with HTML error'))
                        .catch(e => {
                            expect(e.message).toMatch(/Server error/);
                            done();
                        });
                });
            });
        });
    });

    describe('fetchWorkflows', () => {

        describe('happy path', () => {
            const TEST_DATA = [
                { id: 1, label: 'w1' },
                { id: 2, label: 'w2' },
            ];

            beforeEach(() => {
                mockedAxios.request.mockImplementation(() => {
                    return Promise.resolve({ data: [...TEST_DATA] });
                });
            });

            it('should give us data extracted from the response', (done) => {
                fetchWorkflows()
                    .then(data => {
                        expect(data).toEqual(TEST_DATA);
                        done();
                    })
                    .catch(done);
            });
        });

        describe('error cases', () => {

            it.todo('traps exceptions');

            it.todo('traps HTML responses');
        });
    });

    describe('submitConfigurator', () => {
        const TEST_SYSTEM_NAME = 'test-system-name';
        const TEST_SYSTEM_JSON_STRING = JSON.stringify({ test: 'foo' });

        describe('happy path', () => {
            const TEST_DATA = {
                foo: 'bar',
            };

            beforeEach(() => {
                mockedAxios.request.mockImplementation(() => {
                    return Promise.resolve({ data: { ...TEST_DATA }});
                });
            });

            it('should give us the actual data taken out of the response', (done) => {
                submitConfigurator(TEST_SYSTEM_NAME, TEST_SYSTEM_JSON_STRING)
                    .then(data => {
                        expect(data).toEqual(TEST_DATA);
                        done();
                    })
                    .catch(done);
            });
        });

        describe('error cases', () => {

            describe('exception raised', () => {
                const TEST_EXCEPTION = new Error('TEST ERROR');

                beforeEach(() => {
                    mockedAxios.request.mockImplementation(() => {
                        return Promise.reject(TEST_EXCEPTION);
                    });
                });
                
                it('should just be an exception we catch', (done) => {
                    submitConfigurator(TEST_SYSTEM_NAME, TEST_SYSTEM_JSON_STRING)
                        .then(() => done('should have triggered catch block'))
                        .catch(e => {
                            expect(e.message).toEqual(TEST_EXCEPTION.message);
                            done();
                        });
                });
            });

            describe('service returns HTML (indicating something went wrong', () => {

                beforeEach(() => {
                    mockedAxios.request.mockImplementation(() => {
                        return Promise.resolve({
                            headers: {
                                'Content-type': 'text/html',
                            },
                            data: '<html><head></head><body>ERROR</body></html>',
                        });
                    });
                });

                it('should raise an exception for us to catch', (done) => {
                    submitConfigurator(TEST_SYSTEM_NAME, TEST_SYSTEM_JSON_STRING)
                        .then(() => done('should have triggered catch block with HTML error'))
                        .catch(e => {
                            expect(e.message).toMatch(/Server error/);
                            done();
                        });
                });
            });
        });
    });

    describe('submitWorkflow', () => {
        const TEST_WORKFLOW_LABEL = 'w1';

        describe('happy path', () => {
            const TEST_DATA = {
                label: TEST_WORKFLOW_LABEL,
            };

            beforeEach(() => {
                mockedAxios.request.mockImplementation(() => {
                    return Promise.resolve({ data: { ...TEST_DATA } });
                });
            });

            it('should give us the actual data taken out of the response', (done) => {
                submitWorkflow(TEST_WORKFLOW_LABEL)
                    .then(data => {
                        expect(data).toEqual(TEST_DATA);
                        done();
                    })
                    .catch(done);
            });
        });

        describe('error cases', () => {

            it.todo('should trap execptions');

            it.todo('should trap HTML coming from API');
        });
    });
});
