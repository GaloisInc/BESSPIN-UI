import {
    fetchSystems,
    fetchSystemsFailure,
    fetchSystemsSuccess,
    getSystems,
    SystemActionTypes,
    ISystemEntry,
} from './system';

const genDate = (): string => {
    return new Date(Date.now()).toISOString();
};

const DEFAULT_SYSTEM: ISystemEntry = {
    uid: 'TEST-HASH',
    createdAt: genDate(),
    lastUpdate: genDate(),
    filename: 'TEST.fm.json',
    featureCount: 6,
};

const DEFAULT_STATE = {
    system: {
        systems: {},
    },
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
    });

    describe('reducer', () => {

    });

    describe('selectors', () => {
        const TEST_UID = 'TEST-UID';
        const testState = generateTestState({
            system: {
                systems: {
                    [TEST_UID]: generateTestSystem({ uid: TEST_UID }),
                },
            },
        }) ;

        it('should be able to pull systems out of state', () => {
            expect(getSystems(testState)).toEqual(testState.system.systems);
        });
    });
});
