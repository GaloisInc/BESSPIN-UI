/* eslint-disable camelcase */ // disabling for now
import { IFeatureModel, DEFAULT_FEATURE_MODEL } from '../components/graph-helper';

import {
    selection_top,
    selection_push,
    selection_push_elm,
    selection_pop,
    selection_get_mode,
    selection_remove,
    selection_change_mode,
    selection_change_validated,
    selection_mem,
    selection_is_empty,
} from '../state/selection';

export interface ISystemEntry {
    configsPP?: string;
    configs: ISelectionType[];
    conftree: IFeatureModel;
    createdAt: string;
    featureCount: number;
    filename: string;
    lastUpdate: string;
    selectionUndos: ISelectionType[];
    source?: string; // base64-encoded JSON string
    uid: string;
}

export interface ValidateResult {
    serverSource: string;
    serverConstraints: string;
    validatedFeatures: ISelectionType[];
    configuredFeatureModel: IFeatureModel;
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

export type ISelection = ISelectionType[]

export interface ISystemConfigState {
    system: ISystemEntry,
}

export const DEFAULT_CONFIG_SYSTEM_STATE: ISystemConfigState = {
    system: {
        configs: [],
        conftree: DEFAULT_FEATURE_MODEL,
        createdAt: '',
        featureCount: -1,
        filename: '',
        lastUpdate: '',
        selectionUndos: [],
        source: '',
        uid: '',
    },
}

// Actions

export enum SystemActionTypes {
    CLEAR_FEATURE_SELECTIONS = 'system/clear-feature-selections',
    FETCH_TEST_SYSTEM = 'system/fetch-one',
    FETCH_TEST_SYSTEM_FAILURE = 'system/fetch-one/failure',
    FETCH_TEST_SYSTEM_SUCCESS = 'system/fetch-one/success',
    FETCH_TEST_SYSTEMS = 'system/fetch',
    FETCH_TEST_SYSTEMS_FAILURE = 'system/fetch/failure',
    FETCH_TEST_SYSTEMS_SUCCESS = 'system/fetch/success',
    SELECT_FEATURE = 'system/select/feature',
    UNDO_SELECT_FEATURE = 'system/select/undo',
    REDO_SELECT_FEATURE = 'system/select/redo',
    SUBMIT_SYSTEM = 'system/submit',
    SUBMIT_SYSTEM_FAILURE = 'system/submit/failure',
    SUBMIT_SYSTEM_SUCCESS = 'system/submit/success',
    SUBMIT_VALIDATE_CONFIGURATION= 'system/submit/validate',
    SUBMIT_VALIDATE_CONFIGURATION_FAILURE = 'system/submit/validate/failure',
    SUBMIT_VALIDATE_CONFIGURATION_SUCCESS = 'system/submit/validate/success',
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

export const submitSystem = (systemName: string, systemJsonString: string) => {
    return {
        type: SystemActionTypes.SUBMIT_SYSTEM,
        data: {
            systemName,
            systemJsonString,
        },
    } as const;
}

export const submitSystemFailure = (errors: string[]) => {
    return {
        type: SystemActionTypes.SUBMIT_SYSTEM_FAILURE,
        data: {
            errors,
        },
    } as const;
};

export const submitSystemSuccess = (system: ISystemEntry) => {
    return {
        type: SystemActionTypes.SUBMIT_SYSTEM_SUCCESS,
        data: {
            system,
        }
    } as const;
};

export const selectFeature = (uid: string) => {
    return {
        type: SystemActionTypes.SELECT_FEATURE,
        data: {
            uid,
        }
    } as const;
};

export const selectFeatureUndo = () => {
    return {
        type: SystemActionTypes.UNDO_SELECT_FEATURE,
        data: {}
    } as const;
};

export const selectFeatureRedo = () => {
    return {
        type: SystemActionTypes.REDO_SELECT_FEATURE,
        data: {}
    } as const;
};

export const submitValidateConfiguration = (uid: string, selection: ISelectionType[]) => {
    return {
        type: SystemActionTypes.SUBMIT_VALIDATE_CONFIGURATION,
        data: {
            uid,
            selection,
        }
    } as const;
};

export const submitValidateConfigurationFailure = (errors: string[]) => {
    return {
        type: SystemActionTypes.SUBMIT_VALIDATE_CONFIGURATION_FAILURE,
        data: {
            errors
        }
    } as const;
};

export const submitValidateConfigurationSuccess = (uid: string, validateResult: ValidateResult) => {
    return {
        type: SystemActionTypes.SUBMIT_VALIDATE_CONFIGURATION_SUCCESS,
        data: {
            uid,
            validateResult,
        }
    } as const;
};

export type ISystemAction = ReturnType<
    typeof fetchSystem |
    typeof fetchSystemSuccess |
    typeof fetchSystemFailure |
    typeof submitSystem |
    typeof submitSystemSuccess |
    typeof submitSystemFailure |
    typeof selectFeature |
    typeof selectFeatureUndo |
    typeof selectFeatureRedo |
    typeof submitValidateConfiguration |
    typeof submitValidateConfigurationSuccess |
    typeof submitValidateConfigurationFailure
>;

// Reducers

function circle_selection(conftree: IFeatureModel, selected_nodes: ISelection, uid:string): ISelection {
    var thenode = conftree.features[uid];
    var newsel;

    if (selection_mem(selected_nodes, uid)) {
        switch (selection_get_mode(selected_nodes, uid)) {
            case SelectionMode.selected:
                newsel = selection_change_mode(selected_nodes, uid, SelectionMode.rejected);
                newsel = selection_change_validated(newsel, uid, false);
                return newsel;
            case SelectionMode.rejected:
                newsel = selection_remove(selected_nodes, uid);
                return newsel;
        };
    }

    switch (thenode.card) {
        case 'on':
            return selected_nodes;
        case 'off':
            return selected_nodes;
        case 'opt':
            newsel = selection_push(selected_nodes, uid, SelectionMode.selected, uid, false);
            return newsel;
        default:
            alert('no choice!');
            return selected_nodes;
    };
};

export const reducerSystem = (state = DEFAULT_CONFIG_SYSTEM_STATE, action: ISystemAction): ISystemConfigState => {
    switch (action.type) {
        case SystemActionTypes.SUBMIT_SYSTEM_SUCCESS:
            return {
                ...state,
                system: action.data.system,
            };
        case SystemActionTypes.FETCH_TEST_SYSTEM_SUCCESS:
            return {
                ...state,
                system: action.data.system,
            };
        case SystemActionTypes.SUBMIT_VALIDATE_CONFIGURATION_SUCCESS:
            return {
                ...state,
                system: {
                    ...state.system,
                    configs: action.data.validateResult.validatedFeatures,
                    configsPP: action.data.validateResult.serverConstraints,
                }
            };
        case SystemActionTypes.SELECT_FEATURE: {
            const newconfigs = circle_selection(
                state.system.conftree,
                state.system.configs,
                action.data.uid
            );
            return {
                ...state,
                system: {
                    ...state.system,
                    configs: newconfigs,
                }
            };
        }
        case SystemActionTypes.UNDO_SELECT_FEATURE: {
            const configs = state.system.configs;
            const undos = state.system.selectionUndos;
            if (selection_is_empty(configs)) {
                return { ...state }
            }
            const elm = selection_top(configs);
            return {
                ...state,
                system: {
                    ...state.system,
                    configs: selection_pop(configs),
                    selectionUndos: selection_push_elm(undos, elm),
                }
            };
        }
        case SystemActionTypes.REDO_SELECT_FEATURE:
            const configs = state.system.configs;
            const undos = state.system.selectionUndos;
            if (selection_is_empty(undos)) {
                return { ...state }
            }
            const elm = selection_top(undos);
            return {
                ...state,
                system: {
                    ...state.system,
                    configs: selection_push_elm(configs, elm),
                    selectionUndos: selection_pop(undos),
                }
            };
        default:
            return state;
    }
};

// Selectors

interface IState {
    system: ISystemConfigState;
}

export const getSystem = (state: IState) => state.system.system;
