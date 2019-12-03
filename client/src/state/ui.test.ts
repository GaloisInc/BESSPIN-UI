import {
    isLoading,
    getDataRequested,
    getIsLoading,
    UiActionTypes,
} from './ui';

const DEFAULT_STATE = {
    ui: {
        isLoading: false,
        dataRequested: false,
    },
};

const generateTestState = (overrides = {}) => {
    return {
        ...DEFAULT_STATE,
        ...overrides,
    };
};

describe('ui', () => {

    describe('action creators', () => {

        describe('isLoading', () => {

            it('should generate an action with no data', () => {

                expect(isLoading()).toEqual({
                    data: false,
                    type: UiActionTypes.IS_LOADING,
                });
            });
        });
    });

    describe('reducer', () => {

    });

    describe('selectors', () => {
        const testState = generateTestState({
            ui: {
                isLoading: true,
                dataRequested: true,
            },
        }) ;

        it('should be able to pull loading indicator out of state', () => {
            
            expect(getIsLoading(testState)).toEqual(testState.ui.isLoading);
        });

        it('should be able to pull indicator for whether we have initiated a data load out of state', () => {
            
            expect(getDataRequested(testState)).toEqual(testState.ui.dataRequested);
        });
    });
});
