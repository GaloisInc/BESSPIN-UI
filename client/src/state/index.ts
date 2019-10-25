import {
    applyMiddleware,
    combineReducers,
    createStore
} from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';


import { reducer as system, ISystemState } from './system';
import { reducer as testResults, ITestResultsState } from './test-results';
import { reducer as ui, IUiState } from './ui';
import { rootSaga } from './sagas';

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

const sagaMiddleware = createSagaMiddleware();

export const store = createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(sagaMiddleware)),
);

sagaMiddleware.run(rootSaga);
