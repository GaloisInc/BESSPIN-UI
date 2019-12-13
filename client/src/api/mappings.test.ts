import { mapConfiguratorsToSystems } from './mappings';

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
                    last_update: '2019-10-28T23:09:00.000Z',
                    nb_features_selected: 5,
                    configs_pp: '',
                    configured_feature_model: {},
                    source: '',
                },
                {
                    configs: [],
                    conftree: DEFAULT_FEATURE_MODEL,
                    uid: 'UID-2',
                    filename: 'file.two',
                    date: '2019-10-27T23:07:47.650Z',
                    last_update: '2019-10-27T23:09:00.000Z',
                    nb_features_selected: 3,
                    configs_pp: '',
                    configured_feature_model: {},
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
});
