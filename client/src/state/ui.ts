import { createSelector } from 'reselect';

import { IArchExtractAction, ArchExtractActionTypes } from './archExtract';
import { IFeatExtractAction, FeatExtractActionTypes } from './featExtract';
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
    IWorkflowAction |
    IArchExtractAction |
    IFeatExtractAction;

// Reducers

export const reducer = (state = DEFAULT_STATE, action: IUiAction): IUiState => {
    switch (action.type) {
        case ArchExtractActionTypes.LIST_ARCH_EXTRACT:
        case ArchExtractActionTypes.FETCH_ARCH_EXTRACT:
        case ArchExtractActionTypes.NEW_ARCH_EXTRACT:
        case ArchExtractActionTypes.RUN_ARCH_EXTRACT:
        case ArchExtractActionTypes.CONVERT_ARCH_EXTRACT:
        case FeatExtractActionTypes.LIST_FEAT_EXTRACT:
        case FeatExtractActionTypes.FETCH_FEAT_EXTRACT:
        case FeatExtractActionTypes.NEW_FEAT_EXTRACT:
        case FeatExtractActionTypes.RUN_FEAT_EXTRACT:
        case FeatExtractActionTypes.SIMPLIFY_FEAT_EXTRACT:
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
        case ArchExtractActionTypes.LIST_ARCH_EXTRACT_SUCCESS:
        case ArchExtractActionTypes.FETCH_ARCH_EXTRACT_SUCCESS:
        case ArchExtractActionTypes.NEW_ARCH_EXTRACT_SUCCESS:
        case ArchExtractActionTypes.RUN_ARCH_EXTRACT_SUCCESS:
        case ArchExtractActionTypes.CONVERT_ARCH_EXTRACT_SUCCESS:
        case FeatExtractActionTypes.LIST_FEAT_EXTRACT_SUCCESS:
        case FeatExtractActionTypes.FETCH_FEAT_EXTRACT_SUCCESS:
        case FeatExtractActionTypes.NEW_FEAT_EXTRACT_SUCCESS:
        case FeatExtractActionTypes.RUN_FEAT_EXTRACT_SUCCESS:
        case FeatExtractActionTypes.SIMPLIFY_FEAT_EXTRACT_SUCCESS:
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
        case ArchExtractActionTypes.LIST_ARCH_EXTRACT_FAILURE:
        case ArchExtractActionTypes.FETCH_ARCH_EXTRACT_FAILURE:
        case ArchExtractActionTypes.NEW_ARCH_EXTRACT_FAILURE:
        case ArchExtractActionTypes.RUN_ARCH_EXTRACT_FAILURE:
        case ArchExtractActionTypes.CONVERT_ARCH_EXTRACT_FAILURE:
        case FeatExtractActionTypes.LIST_FEAT_EXTRACT_FAILURE:
        case FeatExtractActionTypes.FETCH_FEAT_EXTRACT_FAILURE:
        case FeatExtractActionTypes.NEW_FEAT_EXTRACT_FAILURE:
        case FeatExtractActionTypes.RUN_FEAT_EXTRACT_FAILURE:
        case FeatExtractActionTypes.SIMPLIFY_FEAT_EXTRACT_FAILURE:
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
