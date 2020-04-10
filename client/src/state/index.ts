import {
    applyMiddleware,
    combineReducers,
    createStore
} from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';

import {
    IArchExtractState,
    reducerArchExtract as archExtract,
} from './archExtract'
import {
    reducerSystem as system,
    reducerSystemConfigInput as systemConfigInput,
    IFeatureModelConfigState,
    ISystemConfigInputState,
} from './feature-model';
import {
    reducer as workflow,
    IWorkflowState,
} from './workflow';
import {
    reducerTestgenConfigInput as testgenConfigInput,
    ITestgenConfigInputState,
} from './testgenConfigInput';
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
    system: IFeatureModelConfigState,
    systemConfigInput: ISystemConfigInputState,
    testgenConfigInput: ITestgenConfigInputState,
    testResults: ITestResultsState,
    ui: IUiState,
    workflow: IWorkflowState,
    archExtract: IArchExtractState,
};

const rootReducer = combineReducers({
    system,
    systemConfigInput,
    testgenConfigInput,
    testResults,
    ui,
    workflow,
    archExtract,
});

const sagaMiddleware = createSagaMiddleware();

export const store = createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(sagaMiddleware)),
);

sagaMiddleware.run(rootSaga);
