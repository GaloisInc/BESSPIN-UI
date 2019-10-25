import { createSelector } from 'reselect';

import { SystemActionTypes, ISystemAction } from './system';

export interface IUiState {
    isLoading: boolean;
    dataRequested: boolean
}

export const DEFAULT_STATE = {
    isLoading: true,
    dataRequested: false,
};

// Actions

export const IS_LOADING = 'ui/is-loading';
export const isLoading = () => {
    return {
        type: IS_LOADING,
        data: false,
    } as const;
};

export type IUiAction =
    ReturnType<typeof isLoading> |
    ISystemAction;

// Reducers

export const reducer = (state = DEFAULT_STATE, action: IUiAction) => {
    switch (action.type) {
        case SystemActionTypes.FETCH_TEST_SYSTEMS:
            return {
                ...state,
                isLoading: true,
                dataRequested: true,
            };
        case SystemActionTypes.FETCH_TEST_SYSTEMS_FAILURE:
        case SystemActionTypes.FETCH_TEST_SYSTEMS_SUCCESS:
            return {
                ...state,
                isLoading: false,
            };
        case IS_LOADING:
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
