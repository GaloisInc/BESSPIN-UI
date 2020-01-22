import { createSelector } from 'reselect';

import { ISystemAction } from './system';
import {
    WorkflowActionTypes,
    IWorkflowAction,
} from './workflow';

export interface IUiState {
    error: string;
    isLoading: boolean;
    dataRequested: boolean
}

export const DEFAULT_STATE: IUiState = {
    error: '',
    isLoading: true,
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

export const reducer = (state = DEFAULT_STATE, action: IUiAction) => {
    switch (action.type) {
        case WorkflowActionTypes.FETCH_WORKFLOWS:
            return {
                ...state,
                isLoading: true,
                dataRequested: true,
            };
        case WorkflowActionTypes.FETCH_WORKFLOWS_FAILURE:
        case WorkflowActionTypes.FETCH_WORKFLOWS_SUCCESS:
            return {
                ...state,
                error: '',
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
