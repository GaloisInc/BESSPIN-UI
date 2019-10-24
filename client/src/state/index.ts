import {
    combineReducers,
    createStore
} from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import { reducer as system, ISystemState } from './system';
import { reducer as testResults, ITestResultsState } from './test-results';
import { reducer as ui, IUiState } from './ui';

export interface IState {
    system: ISystemState,
    testResults: ITestResultsState,
    ui: IUiState,
};

const rootReducer = combineReducers({
    system,
    testResults,
    ui,
});

export const store = createStore(
    rootReducer,
    composeWithDevTools(),
);
