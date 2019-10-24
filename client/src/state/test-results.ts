import { createSelector } from 'reselect';

export interface ITestEntry {
    hash: string;
    cpu: string;
    result: string;
}

export interface ITestResultsState {
    entries: ITestEntry[];
}

export const DEFAULT_STATE: ITestResultsState = {
    entries: [{
        hash: 'TEST-HASH-123892347ADFECB',
        cpu: 'TEST CPU',
        result: 'V_HIGH',
    }],
};

// Actions

export enum TestResultsActionTypes {
    FETCH_TEST_RESULTS = 'test-results/fetch',
    FETCH_TEST_RESULTS_FAILURE = 'test-results/fetch/failure',
    FETCH_TEST_RESULTS_SUCCESS = 'test-results/fetch/success',
}

export const fetchTestResults = () => {
    return {
        type: TestResultsActionTypes.FETCH_TEST_RESULTS,
    } as const;
};

export const fetchTestResultsFailure = (errors: string[]) => {
    return {
        type: TestResultsActionTypes.FETCH_TEST_RESULTS_FAILURE,
        data: {
            errors,
        },
    } as const;
};

export const fetchTestResultsSuccess = (entries: ITestEntry[]) => {
    return {
        type: TestResultsActionTypes.FETCH_TEST_RESULTS_SUCCESS,
        data: {
            entries,
        },
    } as const;
};

export type ITestResultsAction = ReturnType<
    typeof fetchTestResultsSuccess
>;

// Reducers

export const reducer = (state = DEFAULT_STATE, action: ITestResultsAction): ITestResultsState => {
    switch (action.type) {
        case TestResultsActionTypes.FETCH_TEST_RESULTS_SUCCESS:
            return {
                ...state,
                entries: action.data.entries,
            };
        default:
            return state;
    }
};

// Selectors

interface IState {
    testResults: ITestResultsState;
}

export const getTestResults = (state: IState) => state.testResults;

export const getEntries = createSelector(
    [getTestResults],
    (testResults) => testResults.entries,
);
