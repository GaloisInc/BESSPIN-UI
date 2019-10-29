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
    hash: 'TEST-HASH',
    createdAt: genDate(),
    lastUpdate: genDate(),
    filename: 'TEST.fm.json',
    featureCount: 6,
};

const DEFAULT_STATE = {
    system: {
        systems: [],
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

        describe('fetchSystemsFailed', () => {

            it('should generate an action with error data', () => {

                expect(fetchSystemsFailure(['TEST ERROR'])).toEqual({
                    data: {
                        errors: ['TEST ERROR'],
                    },
                    type: SystemActionTypes.FETCH_TEST_SYSTEMS_FAILURE,
                });
            });
        });

        describe('fetchSystemsSucceeded', () => {

            it('should generate an action with empty systems data', () => {

                expect(fetchSystemsSuccess([])).toEqual({
                    data: {
                        systems: [],
                    },
                    type: SystemActionTypes.FETCH_TEST_SYSTEMS_SUCCESS,
                });
            });

            it('should generate an action with systems data', () => {
                const testSystem = generateTestSystem();

                expect(fetchSystemsSuccess([testSystem])).toEqual({
                    data: {
                        systems: [testSystem],
                    },
                    type: SystemActionTypes.FETCH_TEST_SYSTEMS_SUCCESS,
                });
            });
        });
    });

    describe('reducer', () => {

    });

    describe('selectors', () => {
        const testState = generateTestState({
            system: {
                systems: [generateTestSystem()],
            },
        }) ;

        it('should be able to pull systems out of state', () => {
            
            expect(getSystems(testState)).toEqual(testState.system.systems);
        })
    });
});
