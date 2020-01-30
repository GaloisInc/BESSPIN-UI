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
    submitValidateConfiguration as submitValidateConfigurationAction,
    submitValidateConfigurationSuccess,
    submitValidateConfigurationFailure,
    updateSystemConfigInput as updateSystemConfigInputAction,
} from './feature-model';

import {
    fetchWorkflowsError,
    fetchWorkflowsSuccess,
    submitWorkflow as submitWorkflowAction,
    submitWorkflowError,
    submitWorkflowSuccess,
    WorkflowActionTypes,
} from './workflow';

function redirectTo(path: string): void {
    if (window && window.location && window.location.href) {
        window.location.href = path;
    } else {
        console.error('No window location to redirect to');
    }
}

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
        yield call(submitSystemConfigurationInputApi, action.data);
        redirectTo('/');
        // The lines below are for the case that we want to either use history to have a SPA or want
        // to use the submitSystemConfigInputSuccess to otherwise continue within the app
        // const createdSysConfigInput = yield call(submitSystemConfigurationInputApi, action.config);
        // const mappedSysConfig = mapSystemConfigInput(createdSysConfigInput);
        // const mappedSysConfig = mapSystemConfigInput(createdSysConfigInput);
        // action.data.history.push('/'); // NOTE: if we do this, we will have to add history as an action parameter from the page component
        // yield put(submitSystemConfigInputSuccess(mappedSysConfig));
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
        yield call(updateSystemConfigurationInputApi, serversideConfig);
        redirectTo('/');
        // The lines below are for the case that we want to either use history to have a SPA or want
        // to use the submitSystemConfigInputSuccess to otherwise continue within the app
        // const updatedSystemConfigInput = yield call(updateSystemConfigurationInputApi, serversideConfig);
        // const mappedSysConfig = mapSystemConfigInput(updatedSystemConfigInput);
        // action.data.history.push('/'); // NOTE: if we do this, we will have to add history as an action parameter from the page component
        // yield put(submitSystemConfigInputSuccess(mappedSysConfig));
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
