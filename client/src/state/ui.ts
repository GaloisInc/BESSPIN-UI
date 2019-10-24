import { createSelector } from 'reselect';

export interface IUiState {
    isLoading: boolean;
}

export const DEFAULT_STATE = {
    isLoading: true,
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
    ReturnType<typeof isLoading>;

// Reducers

export const reducer = (state = DEFAULT_STATE, action: IUiAction) => {
    switch (action.type) {
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
