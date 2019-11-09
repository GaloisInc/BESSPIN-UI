import { createSelector } from 'reselect';
import { IFeatureModel } from '../components/graph-helper';

export interface ISystemEntry {
    configs?: string; // base64-encoded JSON string
    conftree?: IFeatureModel;
    createdAt: string;
    featureCount: number;
    filename: string;
    lastUpdate: string;
    source?: string; // base64-encoded JSON string
    uid: string;
}

export interface ISystemMap {
    [uid: string]: ISystemEntry
}

export enum SelectionMode {
    selected = 'selected',
    unselected = 'unselected',
    rejected = 'rejected',
}

export interface ISelectionType {
    uid: string,
    mode: SelectionMode,
    other: string,
    isValid: boolean,
}

export interface ISelectionMap {
    [id: string]: ISelectionType;
}

export interface ISystemState {
    systems: ISystemMap;
    selections: ISelectionType[],
}

export const DEFAULT_STATE: ISystemState = {
    systems: {},
    selections: [],
};

// Actions

export enum SystemActionTypes {
    FETCH_TEST_SYSTEM = 'system/fetch-one',
    FETCH_TEST_SYSTEM_FAILURE = 'system/fetch-one/failure',
    FETCH_TEST_SYSTEM_SUCCESS = 'system/fetch-one/success',
    FETCH_TEST_SYSTEMS = 'system/fetch',
    FETCH_TEST_SYSTEMS_FAILURE = 'system/fetch/failure',
    FETCH_TEST_SYSTEMS_SUCCESS = 'system/fetch/success',
    SUBMIT_TEST_SYSTEM = 'system/submit',
    SUBMIT_TEST_SYSTEMS_FAILURE = 'system/submit/failure',
    SUBMIT_TEST_SYSTEMS_SUCCESS = 'system/submit/success',

    SELECT_FEATURE = 'system/select/feature',
}

export const fetchSystem = (systemUid: string) => {
    return {
        type: SystemActionTypes.FETCH_TEST_SYSTEM,
        data: {
            systemUid,
        },
    } as const;
};

export const fetchSystemFailure = (errors: string[]) => {
    return {
        type: SystemActionTypes.FETCH_TEST_SYSTEM_FAILURE,
        data: {
            errors,
        },
    } as const;
};

export const fetchSystemSuccess = (system: ISystemEntry) => {
    return {
        type: SystemActionTypes.FETCH_TEST_SYSTEM_SUCCESS,
        data: {
            system,
        },
    } as const;
};

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

export const fetchSystemsSuccess = (systems: ISystemMap) => {
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

export const submitSystemSuccess = (system: ISystemEntry) => {
    return {
        type: SystemActionTypes.SUBMIT_TEST_SYSTEMS_SUCCESS,
        data: {
            system,
        }
    } as const;
};

export const selectFeature = (uid: string, mode: SelectionMode, other: string, isValid: boolean) => {
    return {
        type: SystemActionTypes.SELECT_FEATURE,
        data: {
            uid, mode, other, isValid
        }
    } as const;
};

export type ISystemAction = ReturnType<
    typeof fetchSystem |
    typeof fetchSystemSuccess |
    typeof fetchSystemFailure |
    typeof fetchSystems |
    typeof fetchSystemsSuccess |
    typeof fetchSystemsFailure |
    typeof submitSystem |
    typeof submitSystemSuccess |
    typeof submitSystemFailure |
    typeof selectFeature
>;

// Reducers

export const reducer = (state = DEFAULT_STATE, action: ISystemAction): ISystemState => {
    switch (action.type) {
        case SystemActionTypes.FETCH_TEST_SYSTEMS_SUCCESS:
            return {
                ...state,
                systems: action.data.systems,
            };
        case SystemActionTypes.FETCH_TEST_SYSTEM_SUCCESS:
        case SystemActionTypes.SUBMIT_TEST_SYSTEMS_SUCCESS:
            return {
                ...state,
                systems: {
                    ...state.systems,
                    [action.data.system.uid]: action.data.system,
                },
            };
        case SystemActionTypes.SELECT_FEATURE:
            return {
                ...state,
                selections: state.selections.concat(action.data),
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

export const getSelections = createSelector(
    [getSystem],
    (system) => system.selections,
);

export const getCurrentSelections = createSelector(
    [getSelections],
    (selections) => {
        return selections.reduce<ISelectionMap>((acc, selection) => {
            if (acc[selection.uid]) return acc;
            acc[selection.uid] = selection;
            return acc;
        }, {});
    },
);
