import {
    SystemActionTypes,
    IFeatureModelConfigState,
    IFeatureModelRecord,
    selectFeature,
    SelectionMode,
    reducerSystem,
    reducerSystemConfigInput,
    ISystemConfigInput,
    ISystemConfigInputState,
    fetchSystemConfigInput,
    fetchSystemConfigInputFailure,
    fetchSystemConfigInputSuccess,
    INewSystemConfigInput,
} from './feature-model';

import { DEFAULT_FEATURE_MODEL } from '../components/graph-helper';


const genDate = (): string => {
    return new Date(Date.now()).toISOString();
};

const DEFAULT_SYSTEM: IFeatureModelRecord = {
    configs: [],
    conftree: DEFAULT_FEATURE_MODEL,
    uid: 'TEST-HASH',
    createdAt: genDate(),
    lastUpdate: genDate(),
    filename: 'TEST.fm.json',
    featureCount: 6,
    selectionUndos: [],
};

const DEFAULT_NEW_SYSTEM_CONFIG_INPUT: INewSystemConfigInput = {
    workflowId: 2,
    label: 'TEST SYS CONFIG INPUT',
    nixConfig: '{ some: nix: { config } }',
    nixConfigFilename: 'foo.nix',
};

const DEFAULT_SYSTEM_CONFIG_INPUT: ISystemConfigInput = {
    ...DEFAULT_NEW_SYSTEM_CONFIG_INPUT,
    id: 1,
    createdAt: genDate(),
};

const DEFAULT_SYSTEM_STATE = {
    featureModelRecord: DEFAULT_SYSTEM,
};

const generateTestSystemConfigInputState = (overrides: Partial<ISystemConfigInput> = {}): ISystemConfigInputState => {
    return {
        systemConfigInput: {
            ...DEFAULT_SYSTEM_CONFIG_INPUT,
            ...overrides,
        },
    };
};

const generateTestState = (overrides = {}): IFeatureModelConfigState => {
    return {
        ...DEFAULT_SYSTEM_STATE,
        ...overrides,
    };
};

describe('systems', () => {

    describe('action creators', () => {

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
                        featureModelRecord: {
                            ...DEFAULT_SYSTEM,
                            configs: [],
                            conftree: {
                                ...DEFAULT_SYSTEM.conftree,
                                features: {'TEST-UID-2': {gcard: '', card: 'opt', name: '', children: [], parent: ''}},
                            }
                        },
                    });
                    expect(reducerSystem(testState, selectFeature(TEST_UID)).featureModelRecord.configs).toEqual(
                        [ { uid: TEST_UID, mode: TEST_MODE, other: TEST_UID, isValid: false } ],
                    );
                });
            });

            describe('adding nth selection', () => {

                it('should add the selection', () => {
                    const testState = generateTestState({
                        featureModelRecord: {
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
                        featureModelRecord: {
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

describe('systemConfigInput', () => {

    describe('reducer', () => {

        describe('on initiation of a system configuration input fetch', () => {

            it('should clear out any previous system config input state', () => {
                const testState = generateTestSystemConfigInputState();

                expect(reducerSystemConfigInput(testState, fetchSystemConfigInput(1)).systemConfigInput).toBeUndefined();
            });
        });

        describe('on error during a system configuration input fetch', () => {

            it('should clear out any previous system config input state', () => {
                const testState = generateTestSystemConfigInputState();

                expect(reducerSystemConfigInput(testState, fetchSystemConfigInputFailure('test-error')).systemConfigInput).toBeUndefined();
            });
        });

        describe('on successful fetch of system configuration input', () => {

            it('should add the fetched system input config to the state', () => {
                const testState = generateTestSystemConfigInputState({});
                const testSystem = {
                    ...DEFAULT_SYSTEM_CONFIG_INPUT,
                };

                expect(reducerSystemConfigInput(testState, fetchSystemConfigInputSuccess(testSystem))).toEqual(generateTestSystemConfigInputState());
            });
        });
    });
});
