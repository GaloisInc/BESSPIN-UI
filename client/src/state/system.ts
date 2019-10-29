import { createSelector } from 'reselect';

export interface ISystemEntry {
    hash: string;
    createdAt: string;
    lastUpdate: string;
    featureCount: number;
    filename: string;
}

export interface ISystemState {
    systems: ISystemEntry[];
}

export const DEFAULT_STATE: ISystemState = {
    systems: [{
        hash: 'TEST-HASH-123892347ADFECB',
        createdAt: Date.now().toString(),
        lastUpdate: Date.now().toString(),
        featureCount: 5,
        filename: 'foo.fm.json',
    }],
};

// Actions

export enum SystemActionTypes {
    FETCH_TEST_SYSTEMS = 'system/fetch',
    FETCH_TEST_SYSTEMS_FAILURE = 'system/fetch/failure',
    FETCH_TEST_SYSTEMS_SUCCESS = 'system/fetch/success',
    SUBMIT_TEST_SYSTEM = 'system/submit',
    SUBMIT_TEST_SYSTEMS_FAILURE = 'system/submit/failure',
    SUBMIT_TEST_SYSTEMS_SUCCESS = 'system/submit/success',
}

export const fetchSystems = () => {
    return {
        type: SystemActionTypes.FETCH_TEST_SYSTEMS,
    } as const;
};

export const fetchSystemsFailure = (errors: string[]) => {
    return {
        type: SystemActionTypes.FETCH_TEST_SYSTEMS_FAILURE,
        data: {
            errors,
        },
    } as const;
};

export const fetchSystemsSuccess = (systems: ISystemEntry[]) => {
    return {
        type: SystemActionTypes.FETCH_TEST_SYSTEMS_SUCCESS,
        data: {
            systems,
        },
    } as const;
};

export const submitSystem = (systemName: string, systemJsonString: string) => {
    return {
        type: SystemActionTypes.SUBMIT_TEST_SYSTEM,
        data: {
            systemName,
            systemJsonString,
        },
    } as const;
}

export const submitSystemFailure = (errors: string[]) => {
    return {
        type: SystemActionTypes.SUBMIT_TEST_SYSTEMS_FAILURE,
        data: {
            errors,
        },
    } as const;
};

export const submitSystemSuccess = () => {
    return {
        type: SystemActionTypes.SUBMIT_TEST_SYSTEMS_SUCCESS,
    } as const;
};

export type ISystemAction = ReturnType<
    typeof fetchSystems |
    typeof fetchSystemsSuccess |
    typeof fetchSystemsFailure |
    typeof submitSystem |
    typeof submitSystemSuccess |
    typeof submitSystemFailure
>;

// Reducers

export const reducer = (state = DEFAULT_STATE, action: ISystemAction): ISystemState => {
    switch (action.type) {
        case SystemActionTypes.FETCH_TEST_SYSTEMS_SUCCESS:
            return {
                ...state,
                systems: action.data.systems,
            };
        default:
            return state;
    }
};

// Selectors

interface IState {
    system: ISystemState;
}

export const getSystem = (state: IState) => state.system;

export const getSystems = createSelector(
    [getSystem],
    (system) => system.systems,
);
