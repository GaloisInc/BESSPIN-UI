import {
    applyMiddleware,
    combineReducers,
    createStore
} from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';

import {
    reducerSystems as systems,
    reducerSystem as system,
    ISystemState,
    ISystemConfigState,
} from './system';
import {
    reducer as workflow,
    IWorkflowState,
} from './workflow';
import {
    reducer as testResults,
    ITestResultsState,
} from './test-results';
import {
    reducer as ui,
    IUiState,
} from './ui';
import { rootSaga } from './sagas';

export interface IState {
    systems: ISystemState,
    system: ISystemConfigState,
    testResults: ITestResultsState,
    ui: IUiState,
    workflow: IWorkflowState,
};

const rootReducer = combineReducers({
    systems,
    system,
    testResults,
    ui,
    workflow,
});

const sagaMiddleware = createSagaMiddleware();

export const store = createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(sagaMiddleware)),
);

sagaMiddleware.run(rootSaga);
