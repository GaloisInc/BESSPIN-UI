import {
	call,
	put,
	takeLatest,
} from 'redux-saga/effects';

import {
    fetchConfigurator,
    fetchConfigurators,
    fetchWorkflows as fetchApiWorkflows,
    submitConfigurator,
    submitValidateConfiguration as submitValidateConfigurationFunction,
} from '../api/api';

import {
    mapConfiguratorToSystem,
    mapConfiguratorsToSystems,
    mapUploadConfiguratorToSystem,
    mapValidateResponse,
    mapValidateRequestForServer,
    mapWorkflows,
} from '../api/mappings';

import {
    fetchSystem as fetchSystemAction,
    fetchSystemFailure,
    fetchSystemSuccess,
    fetchSystemsFailure,
    fetchSystemsSuccess,
    submitSystemFailure,
    submitSystemSuccess,
    SystemActionTypes,
    submitSystem as submitSystemAction,
    submitValidateConfiguration as submitValidateConfigurationAction,
    submitValidateConfigurationSuccess,
    submitValidateConfigurationFailure,
} from './system';

import {
    fetchWorkflowsError,
    fetchWorkflowsSuccess,
    WorkflowActionTypes,
} from './workflow';

function* fetchSystem(action: ReturnType<typeof fetchSystemAction>) {
    try {
        const configurator = yield call(fetchConfigurator, action.data.systemUid);
        const mappedConfigurator = mapConfiguratorToSystem(configurator);
        yield put(fetchSystemSuccess(mappedConfigurator));
    } catch (e) {
        console.error(e);
        yield put(fetchSystemFailure(e.message));
    }
}

function* fetchSystems() {
    try {
        const configurators = yield call(fetchConfigurators);
        const mappedConfigurators = mapConfiguratorsToSystems(configurators);
		yield put(fetchSystemsSuccess(mappedConfigurators));
    } catch (e) {
        console.error(e);
        yield put(fetchSystemsFailure(e.message));
    }
}

function* fetchWorkflows() {
    try {
        const workflows = yield call(fetchApiWorkflows);
        const mappedWorkflows = mapWorkflows(workflows);
        yield put(fetchWorkflowsSuccess(mappedWorkflows));
    } catch (e) {
        console.error(e);
        yield put(fetchWorkflowsError(e.message));
    }
}

function* submitSystem(action: ReturnType<typeof submitSystemAction>) {
    try {
        const configurator = yield call(submitConfigurator, action.data.systemName, action.data.systemJsonString);
        const mappedConfigurator = mapUploadConfiguratorToSystem(configurator);
        yield put(submitSystemSuccess(mappedConfigurator));
    } catch (e) {
        console.error(e);
        yield put(submitSystemFailure(e.message));
    }
}

function* submitValidateConfiguration(action: ReturnType<typeof submitValidateConfigurationAction>) {
    try {
        const selectionServer = mapValidateRequestForServer(action.data.selection);
        const validateResponse = yield call(
            submitValidateConfigurationFunction,
            action.data.uid,
            selectionServer,
        );
        const validateResult = mapValidateResponse(validateResponse);
        yield put(submitValidateConfigurationSuccess(action.data.uid, validateResult));
    } catch (e) {
        console.error(e);
        yield put(submitValidateConfigurationFailure(e.message));
    }
}

// Register all the actions that should trigger our sagas
export function* rootSaga() {
    yield takeLatest(SystemActionTypes.SUBMIT_SYSTEM, submitSystem);
    yield takeLatest(SystemActionTypes.FETCH_TEST_SYSTEMS, fetchSystems);
    yield takeLatest(SystemActionTypes.FETCH_TEST_SYSTEM, fetchSystem);
    yield takeLatest(SystemActionTypes.SUBMIT_VALIDATE_CONFIGURATION, submitValidateConfiguration);
    yield takeLatest(WorkflowActionTypes.FETCH_WORKFLOWS, fetchWorkflows);
};
