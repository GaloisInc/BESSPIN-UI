import {
	call,
	put,
	takeLatest,
} from 'redux-saga/effects';

import {
    fetchConfigurator,
    fetchWorkflows as fetchWorkflowsApi,
    fetchSystemConfigurationInput as fetchSystemConfigurationInputApi,
    submitConfigurator,
    submitWorkflow as submitWorkflowApi,
    submitSystemConfigurationInput as submitSystemConfigurationInputApi,
    submitValidateConfiguration as submitValidateConfigurationApi,
    updateSystemConfigurationInput as updateSystemConfigurationInputApi,
} from '../api/api';

import {
    mapConfiguratorToSystem,
    mapSystemConfigInput,
    mapUploadConfiguratorToSystem,
    mapValidateResponse,
    mapValidateRequestForServer,
    mapWorkflow,
    mapWorkflows,
    mapSystemConfigInputToServerside,
} from '../api/mappings';

import {
    fetchSystem as fetchSystemAction,
    fetchSystemFailure,
    fetchSystemSuccess,
    fetchSystemConfigInput as fetchSystemConfigurationInputAction,
    fetchSystemConfigInputFailure,
    fetchSystemConfigInputSuccess,
    submitSystemFailure,
    submitSystemSuccess,
    SystemActionTypes,
    submitSystem as submitSystemAction,
    submitSystemConfigInput as submitSystemConfigurationInputAction,
    submitSystemConfigInputFailure,
    submitSystemConfigInputSuccess,
    submitValidateConfiguration as submitValidateConfigurationAction,
    submitValidateConfigurationSuccess,
    submitValidateConfigurationFailure,
    updateSystemConfigInput as updateSystemConfigInputAction,
} from './system';

import {
    fetchWorkflowsError,
    fetchWorkflowsSuccess,
    submitWorkflow as submitWorkflowAction,
    submitWorkflowError,
    submitWorkflowSuccess,
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

function* fetchSystemConfigInput(action: ReturnType<typeof fetchSystemConfigurationInputAction>) {
    try {
        const sysConfig = yield call(fetchSystemConfigurationInputApi, action.data);
        const mappedSysConfig = mapSystemConfigInput(sysConfig);
        yield put(fetchSystemConfigInputSuccess(mappedSysConfig));
    } catch (e) {
        console.error(e);
        yield put(fetchSystemConfigInputFailure(e.message));
    }
}

function* fetchWorkflows() {
    try {
        const workflows = yield call(fetchWorkflowsApi);
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

function* submitSystemConfigInput(action: ReturnType<typeof submitSystemConfigurationInputAction>) {
    try {
        const createdSysConfigInput = yield call(submitSystemConfigurationInputApi, action.data);
        const mappedSysConfig = mapSystemConfigInput(createdSysConfigInput);
        yield put(submitSystemConfigInputSuccess(mappedSysConfig));
    } catch (e) {
        console.error(e);
        yield put(submitSystemConfigInputFailure(e.message));
    }
}

function* submitWorkflow(action: ReturnType<typeof submitWorkflowAction>) {
    try {
        const workflow = yield call(submitWorkflowApi, action.data);
        const mappedWorkflow = yield call(mapWorkflow, workflow);
        yield put(submitWorkflowSuccess(mappedWorkflow));
    } catch (e) {
        console.error(e);
        yield put(submitWorkflowError(e.message));
    }
}

function* submitValidateConfiguration(action: ReturnType<typeof submitValidateConfigurationAction>) {
    try {
        const selectionServer = mapValidateRequestForServer(action.data.selection);
        const validateResponse = yield call(
            submitValidateConfigurationApi,
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

function* updateSystemConfigInput(action: ReturnType<typeof updateSystemConfigInputAction>) {
    try {
        const serversideConfig = mapSystemConfigInputToServerside(action.data);
        const updatedSystemConfigInput = yield call(updateSystemConfigurationInputApi, serversideConfig);
        const mappedSysConfig = mapSystemConfigInput(updatedSystemConfigInput);
        yield put(submitSystemConfigInputSuccess(mappedSysConfig));
    } catch (e) {
        console.error(e);
        yield put(submitSystemConfigInputFailure(e.message));
    }
}

// Register all the actions that should trigger our sagas
export function* rootSaga() {
    yield takeLatest(SystemActionTypes.SUBMIT_SYSTEM, submitSystem);
    yield takeLatest(SystemActionTypes.FETCH_TEST_SYSTEM, fetchSystem);
    yield takeLatest(SystemActionTypes.SUBMIT_VALIDATE_CONFIGURATION, submitValidateConfiguration);
    yield takeLatest(WorkflowActionTypes.FETCH_WORKFLOWS, fetchWorkflows);
    yield takeLatest(WorkflowActionTypes.SUBMIT_WORKFLOW, submitWorkflow);
    yield takeLatest(SystemActionTypes.SUBMIT_SYSTEM_CONFIG_INPUT, submitSystemConfigInput);
    yield takeLatest(SystemActionTypes.FETCH_SYSTEM_CONFIG_INPUT, fetchSystemConfigInput);
    yield takeLatest(SystemActionTypes.UPDATE_SYSTEM_CONFIG_INPUT, updateSystemConfigInput);
};
