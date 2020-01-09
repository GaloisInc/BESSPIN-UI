import {
    fetchSystems,
    fetchSystemsFailure,
    fetchSystemsSuccess,
    SystemActionTypes,
    ISystemEntry,
    selectFeature,
    SelectionMode,
    reducerSystem,
} from './system';

import { DEFAULT_FEATURE_MODEL } from '../components/graph-helper';


const genDate = (): string => {
    return new Date(Date.now()).toISOString();
};

const DEFAULT_SYSTEM: ISystemEntry = {
    configs: [],
    conftree: DEFAULT_FEATURE_MODEL,
    uid: 'TEST-HASH',
    createdAt: genDate(),
    lastUpdate: genDate(),
    filename: 'TEST.fm.json',
    featureCount: 6,
    selectionUndos: [],
};

const DEFAULT_STATE = {
    systems: {},
    system: DEFAULT_SYSTEM,
};

const generateTestSystem = (overrides: Partial<ISystemEntry> = {}): ISystemEntry => {
    return {
        ...DEFAULT_SYSTEM,
        ...overrides,
    };
};

const generateTestState = (overrides = {}) => {
    return {
        ...DEFAULT_STATE,
        ...overrides,
    };
};

describe('systems', () => {

    describe('action creators', () => {

        describe('fetchSystems', () => {

            it('should generate an action with no data', () => {

                expect(fetchSystems()).toEqual({
                    type: SystemActionTypes.FETCH_TEST_SYSTEMS,
                });
            });
        });

        describe('fetchSystemsFailure', () => {

            it('should generate an action with error data', () => {

                expect(fetchSystemsFailure(['TEST ERROR'])).toEqual({
                    data: {
                        errors: ['TEST ERROR'],
                    },
                    type: SystemActionTypes.FETCH_TEST_SYSTEMS_FAILURE,
                });
            });
        });

        describe('fetchSystemsSuccess', () => {

            it('should generate an action with empty systems data', () => {

                expect(fetchSystemsSuccess({})).toEqual({
                    data: {
                        systems: {},
                    },
                    type: SystemActionTypes.FETCH_TEST_SYSTEMS_SUCCESS,
                });
            });

            it('should generate an action with systems data', () => {
                const testSystem = generateTestSystem();

                expect(fetchSystemsSuccess({ [testSystem.uid]: testSystem })).toEqual({
                    data: {
                        systems: {
                            [testSystem.uid]: testSystem,
                        },
                    },
                    type: SystemActionTypes.FETCH_TEST_SYSTEMS_SUCCESS,
                });
            });
        });

        describe('selectFeature', () => {
            const TEST_UID = 'TEST-UID';

            it('should generate an action with selection data', () => {
                expect(selectFeature(TEST_UID)).toEqual({
                    data: {
                        uid: TEST_UID,
                    },
                    type: SystemActionTypes.SELECT_FEATURE,
                });
            });
        });
    });

    describe('reducer', () => {

        describe('selections', () => {
            const TEST_UID = 'TEST-UID-2';
            const TEST_MODE = SelectionMode.selected;

            describe('adding first selection', () => {

                it('should add the selection', () => {
                    const testState = generateTestState({
                        systems: {},
                        system: {
                            ...DEFAULT_SYSTEM,
                            configs: [],
                            conftree: {
                                ...DEFAULT_SYSTEM.conftree,
                                features: {'TEST-UID-2': {gcard: '', card: 'opt', name: '', children: [], parent: ''}},
                            }
                        },
                    });
                    expect(reducerSystem(testState, selectFeature(TEST_UID)).system.configs).toEqual(
                        [ { uid: TEST_UID, mode: TEST_MODE, other: TEST_UID, isValid: false } ],
                    );
                });
            });

            describe('adding nth selection', () => {

                it('should add the selection', () => {
                    const testState = generateTestState({
                        systems: {},
                        system: {
                            ...DEFAULT_SYSTEM,
                            configs: [
                                { uid: 'TEST-UID-1', mode: SelectionMode.rejected, offer: 'TEST-UID-1', isValid: false },
                                { uid: 'TEST-UID-2', mode: SelectionMode.selected, offer: 'TEST-UID-2', isValid: false },
                                { uid: 'TEST-UID-3', mode: SelectionMode.selected, offer: 'TEST-UID-3', isValid: false },
                            ],
                        },
                    });

                    const reducedState = reducerSystem(testState, selectFeature(TEST_UID));
                    expect(reducedState).toEqual({
                        systems: {},
                        system: {
                            ...DEFAULT_SYSTEM,
                            configs: [
                                { uid: 'TEST-UID-1', mode: SelectionMode.rejected, offer: 'TEST-UID-1', isValid: false },
                                { uid: 'TEST-UID-2', mode: SelectionMode.rejected, offer: 'TEST-UID-2', isValid: false },
                                { uid: 'TEST-UID-3', mode: SelectionMode.selected, offer: 'TEST-UID-3', isValid: false },
                            ],
                        }
                    });
                });
            });
        });
    });

});
