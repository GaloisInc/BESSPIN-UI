import { createSelector } from 'reselect';

import { ISystemAction, SystemActionTypes } from './feature-model';
import {
    WorkflowActionTypes,
    IWorkflowAction,
} from './workflow';

export interface IUiState {
    error: string;
    isLoading: boolean;
    dataRequested: boolean;
}

export const DEFAULT_STATE: IUiState = {
    error: '',
    isLoading: false,
    dataRequested: false,
};

// Actions

export enum UiActionTypes {
    IS_LOADING = 'ui/is-loading',
}

export const isLoading = () => {
    return {
        type: UiActionTypes.IS_LOADING,
        data: false,
    } as const;
};

export type IUiAction =
    ReturnType<typeof isLoading> |
    ISystemAction |
    IWorkflowAction;

// Reducers

export const reducer = (state = DEFAULT_STATE, action: IUiAction): IUiState => {
    switch (action.type) {
        case WorkflowActionTypes.FETCH_WORKFLOW:
        case WorkflowActionTypes.FETCH_WORKFLOWS:
        case SystemActionTypes.FETCH_SYSTEM_CONFIG_INPUT:
            return {
                ...state,
                isLoading: true,
                dataRequested: true,
            };
        case SystemActionTypes.SUBMIT_SYSTEM_CONFIG_INPUT:
        case WorkflowActionTypes.TRIGGER_REPORT:
        case SystemActionTypes.SUBMIT_VALIDATE_CONFIGURATION:
        case SystemActionTypes.FETCH_TEST_SYSTEM_BY_VULN:
        case SystemActionTypes.SUBMIT_VULNERABILITY_CLASS:
            return {
                ...state,
                isLoading: true,
            };
        case WorkflowActionTypes.FETCH_WORKFLOW_SUCCESS:
        case WorkflowActionTypes.FETCH_WORKFLOWS_SUCCESS:
        case SystemActionTypes.FETCH_SYSTEM_CONFIG_INPUT_SUCCESS:
        case SystemActionTypes.SUBMIT_SYSTEM_CONFIG_INPUT_SUCCESS:
        case WorkflowActionTypes.TRIGGER_REPORT_SUCCESS:
        case WorkflowActionTypes.CLONE_WORKFLOW_SUCCESS:
        case WorkflowActionTypes.UPDATE_WORKFLOW_SUCCESS:
        case SystemActionTypes.SUBMIT_VALIDATE_CONFIGURATION_SUCCESS:
        case SystemActionTypes.FETCH_TEST_SYSTEM_BY_VULN_SUCCESS:
        case SystemActionTypes.SUBMIT_VULNERABILITY_CLASS_SUCCESS:
            return {
                ...state,
                error: '',
                isLoading: false,
            };
        case WorkflowActionTypes.FETCH_WORKFLOW_FAILURE:
        case WorkflowActionTypes.FETCH_WORKFLOWS_FAILURE:
        case SystemActionTypes.FETCH_SYSTEM_CONFIG_INPUT_FAILURE:
        case SystemActionTypes.SUBMIT_SYSTEM_CONFIG_INPUT_FAILURE:
        case WorkflowActionTypes.TRIGGER_REPORT_FAILURE:
        case WorkflowActionTypes.CLONE_WORKFLOW_FAILURE:
        case WorkflowActionTypes.UPDATE_WORKFLOW_FAILURE:
        case SystemActionTypes.SUBMIT_VALIDATE_CONFIGURATION_FAILURE:
        case SystemActionTypes.FETCH_TEST_SYSTEM_BY_VULN_FAILURE:
        case SystemActionTypes.SUBMIT_VULNERABILITY_CLASS_FAILURE:
            return {
                ...state,
                error: action.data,
                isLoading: false,
            };
        case UiActionTypes.IS_LOADING:
            return {
                ...state,
                isLoading: action.data,
            };
        default:
            return state;
    }
}

// Selectors

interface IState {
    ui: IUiState;
}

export const getUiState = (state: IState) => state.ui;

export const getIsLoading = createSelector(
    [getUiState],
    (uiState) => uiState.isLoading,
);

export const getDataRequested = createSelector(
    [getUiState],
    (uiState) => uiState.dataRequested,
);

export const getError = createSelector(
    [getUiState],
    (uiState) => uiState.error,
);
