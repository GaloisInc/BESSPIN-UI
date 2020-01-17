import {
    mapConfiguratorsToSystems,
    mapWorkflow,
    mapWorkflows,
    IServersideWorkflow,
} from './mappings';
import {
    IWorkflow,
} from '../state/workflow';

import { DEFAULT_FEATURE_MODEL } from '../components/graph-helper';

describe('mappings', () => {

    describe('mapConfiguratorsToSystems', () => {

        describe('when no data to map', () => {

            it('should return an empty list', () => {
                expect(mapConfiguratorsToSystems([])).toEqual({});
            });
        });

        describe('when given data to map', () => {
            const TEST_DATA = [
                {
                    configs: [],
                    conftree: DEFAULT_FEATURE_MODEL,
                    uid: 'UID-1',
                    filename: 'file.one',
                    date: '2019-10-28T23:07:47.650Z',
                    last_update: '2019-10-28T23:09:00.000Z', // eslint-disable-line camelcase
                    nb_features_selected: 5, // eslint-disable-line camelcase
                    configs_pp: '', // eslint-disable-line camelcase
                    configured_feature_model: {}, // eslint-disable-line camelcase
                    source: '',
                },
                {
                    configs: [],
                    conftree: DEFAULT_FEATURE_MODEL,
                    uid: 'UID-2',
                    filename: 'file.two',
                    date: '2019-10-27T23:07:47.650Z',
                    last_update: '2019-10-27T23:09:00.000Z', // eslint-disable-line camelcase
                    nb_features_selected: 3, // eslint-disable-line camelcase
                    configs_pp: '', // eslint-disable-line camelcase
                    configured_feature_model: {}, // eslint-disable-line camelcase
                    source: '',
                },
            ];

            const TEST_RESULTS = {
                'UID-1': {
                    configs: [],
                    conftree: DEFAULT_FEATURE_MODEL,
                    uid: 'UID-1',
                    filename: 'file.one',
                    createdAt: '2019-10-28T23:07:47.650Z',
                    lastUpdate: '2019-10-28T23:09:00.000Z',
                    featureCount: 5,
                    selectionUndos: [],
                    configsPP: '',
                    source: '',
                },
                'UID-2': {
                    configs: [],
                    conftree: DEFAULT_FEATURE_MODEL,
                    uid: 'UID-2',
                    filename: 'file.two',
                    createdAt: '2019-10-27T23:07:47.650Z',
                    lastUpdate: '2019-10-27T23:09:00.000Z',
                    featureCount: 3,
                    selectionUndos: [],
                    configsPP: '',
                    source: '',
                },
            };

            it('should return related system entries', () => {
                expect(mapConfiguratorsToSystems(TEST_DATA)).toEqual(TEST_RESULTS);
            });
        });
    });

    describe('mapWorkflow', () => {

        it.todo('should map minimal serverside workflow into client one');
        it.todo('should map workflow that also has updatedAt information');
        it.todo('should map workflow that also system configuration information');
        it.todo('should map workflow that also test configuration information');
        it.todo('should map workflow that also report information');
        // TODO: are the error messages coming from the API?
    });

    describe('mapWorkflows', () => {

        it('should simply pass thru the given workflow data', () => {
            const TEST_API_WORKFLOWS: IServersideWorkflow[] = [
                { workflowId: 1, label: 'w1', createdAt: 'SOME DATESTRING' },
                { workflowId: 2, label: 'w2', createdAt: 'SOME DATESTRING' },
            ];

            const TEST_CLIENT_WORKFLOWS: IWorkflow[] = [
                { id: 1, label: 'w1', createdAt: 'SOME DATESTRING' },
                { id: 2, label: 'w2', createdAt: 'SOME DATESTRING' },
            ];
            expect(mapWorkflows(TEST_API_WORKFLOWS)).toEqual(TEST_CLIENT_WORKFLOWS);
        })
    });
});
