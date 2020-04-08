import {
	call,
	put,
	takeLatest,
} from 'redux-saga/effects';

import {
    cloneWorkflow as cloneWorkflowApi,
    listArchExtract as listArchExtractApi,
    fetchArchExtract as fetchArchExtractApi,
    newArchExtract as newArchExtractApi,
    submitArchExtract as submitArchExtractApi,
    runArchExtract as runArchExtractApi,
    convertArchExtract as convertArchExtractApi,
    fetchConfigurator,
    fetchConfiguratorByVulnConfig as fetchConfiguratatorByVulnConfigApi,
    fetchSystemConfigurationInput as fetchSystemConfigurationInputApi,
    createTestgenConfigInput as createTestgenConfigInputApi,
    submitTestgenConfigInput as submitTestgenConfigInputApi,
    fetchTestgenConfigInput as fetchTestgenConfigInputApi,
    fetchWorkflow as fetchWorkflowApi,
    fetchWorkflows as fetchWorkflowsApi,
    submitConfigurator,
    submitSystemConfigurationInput as submitSystemConfigurationInputApi,
    submitValidateConfiguration as submitValidateConfigurationApi,
    submitVulnerabilityClass as submitVulnerabilityClassApi,
    submitWorkflow as submitWorkflowApi,
    triggerReport as triggerReportApi,
    updateSystemConfigurationInput as updateSystemConfigurationInputApi,
    updateWorkflow as updateWorkflowApi,
} from '../api/api';

import {
    mapConfiguratorToSystem,
    mapSystemConfigInput,
    mapTestgenConfigInput,
    mapUploadConfiguratorToSystem,
    mapValidateResponse,
    mapValidateRequestForServer,
    mapWorkflow,
    mapWorkflows,
    mapSystemConfigInputToServerside,
    mapArchExtractList,
    mapArchExtractFetch,
    mapArchExtractNew,
    mapArchExtractRun,
    mapArchExtractConvert,
} from '../api/mappings';

import {
    ArchExtractActionTypes,
    listArchExtract as listArchExtractAction,
    listArchExtractSuccess,
    listArchExtractFailure,
    fetchArchExtract as fetchArchExtractAction,
    fetchArchExtractSuccess,
    fetchArchExtractFailure,
    newArchExtract as newArchExtractAction,
    newArchExtractSuccess,
    newArchExtractFailure,
    submitArchExtract as submitArchExtractAction,
    submitArchExtractSuccess,
    submitArchExtractFailure,
    runArchExtract as runArchExtractAction,
    runArchExtractSuccess,
    runArchExtractFailure,
    convertArchExtract as convertArchExtractAction,
    convertArchExtractSuccess,
    convertArchExtractFailure,
} from './archExtract'

import {
    createTestgenConfigInput as createTestgenConfigInputAction,
    createTestgenConfigInputSuccess,
    createTestgenConfigInputFailure,
    submitTestgenConfigInput as submitTestgenConfigInputAction,
    submitTestgenConfigInputSuccess,
    submitTestgenConfigInputFailure,
    fetchTestgenConfigInput as fetchTestgenConfigInputAction,
    fetchTestgenConfigInputSuccess,
    fetchTestgenConfigInputFailure,
    TestgenConfigActionTypes,
} from './testgenConfigInput'

import {
    fetchSystem as fetchSystemAction,
    fetchSystemFailure,
    fetchSystemSuccess,
    fetchSystemByVulnConfig as fetchSystemByVulnConfigAction,
    fetchSystemByVulnConfigFailure,
    fetchSystemByVulnConfigSuccess,
    fetchSystemConfigInput as fetchSystemConfigurationInputAction,
    fetchSystemConfigInputFailure,
    fetchSystemConfigInputSuccess,
    submitSystemFailure,
    submitSystemSuccess,
    SystemActionTypes,
    submitSystem as submitSystemAction,
    submitSystemConfigInput as submitSystemConfigurationInputAction,
    submitSystemConfigInputFailure,
    submitVulnerabilityClass as submitVulnerabilityClassAction,
    submitVulnerabilityClassFailure,
    submitVulnerabilityClassSuccess,
    submitValidateConfiguration as submitValidateConfigurationAction,
    submitValidateConfigurationSuccess,
    submitValidateConfigurationFailure,
    updateSystemConfigInput as updateSystemConfigInputAction,
} from './feature-model';

import {
    cloneWorkflow as cloneWorkflowAction,
    cloneWorkflowError,
    cloneWorkflowSuccess,
    fetchWorkflow as fetchWorkflowAction,
    fetchWorkflowError,
    fetchWorkflowSuccess,
    fetchWorkflowsError,
    fetchWorkflowsSuccess,
    submitWorkflow as submitWorkflowAction,
    submitWorkflowError,
    submitWorkflowSuccess,
    triggerReport as triggerReportAction,
    triggerReportError,
    triggerReportSuccess,
    updateWorkflow as updateWorkflowAction,
    updateWorkflowError,
    updateWorkflowSuccess,
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


function* listArchExtract(action: ReturnType<typeof listArchExtractAction>) {
    try {
        const archExtractIdList = yield call(listArchExtractApi);
        const mappedRes = mapArchExtractList(archExtractIdList);
        yield put(listArchExtractSuccess(mappedRes));
    } catch (e) {
        console.error(e);
        yield put(listArchExtractFailure(e.message));
    }
}

function* fetchArchExtract(action: ReturnType<typeof fetchArchExtractAction>) {
    try {
        const archExtractRecord = yield call(fetchArchExtractApi, action.data.archExtractId);
        const mappedRes = mapArchExtractFetch(archExtractRecord);
        yield put(fetchArchExtractSuccess(mappedRes));
    } catch (e) {
        console.error(e);
        yield put(fetchArchExtractFailure(e.message));
    }
}

function* newArchExtract(action: ReturnType<typeof newArchExtractAction>) {
    try {
        const archExtractRecord = yield call(newArchExtractApi, action.data.cpuTemplate, action.data.label);
        const mappedRes = mapArchExtractNew(archExtractRecord);
        yield put(newArchExtractSuccess(mappedRes));
    } catch (e) {
        console.error(e);
        yield put(newArchExtractFailure(e.message));
    }
}

function* submitArchExtract(action: ReturnType<typeof submitArchExtractAction>) {
    try {
        const archExtractRecord = yield call(submitArchExtractApi, action.data.archExtractId, action.data.archExtractInput);
        yield put(submitArchExtractSuccess(action.data.archExtractInput));
    } catch (e) {
        console.error(e);
        yield put(submitArchExtractFailure(e.message));
    }
}

function* runArchExtract(action: ReturnType<typeof runArchExtractAction>) {
    try {
        const serverResponse = yield call(runArchExtractApi, action.data.archExtractId);
        const mappedResponse = mapArchExtractRun(serverResponse);
        yield put(runArchExtractSuccess(mappedResponse));
    } catch (e) {
        console.error(e);
        yield put(runArchExtractFailure(e.message));
    }
}

function* convertArchExtract(action: ReturnType<typeof convertArchExtractAction>) {
    try {
        const serverResponse = yield call(convertArchExtractApi, action.data.archExtractOutputId);
        const mappedResponse = mapArchExtractConvert(serverResponse);
        yield put(convertArchExtractSuccess(mappedResponse));
    } catch (e) {
        console.error(e);
        yield put(convertArchExtractFailure(e.message));
    }
}

function* createTestgenConfigInput(action: ReturnType<typeof createTestgenConfigInputAction>) {
    try {
        const testgenConfigInputRecord = yield call(createTestgenConfigInputApi, action.data.workflowId);
        const mappedTestgenConfig = mapTestgenConfigInput(testgenConfigInputRecord);
        yield put(createTestgenConfigInputSuccess(mappedTestgenConfig));
    } catch (e) {
        console.error(e);
        yield put(createTestgenConfigInputFailure(e.message));
    }
}

function* submitTestgenConfigInput(action: ReturnType<typeof submitTestgenConfigInputAction>) {
    try {
        const testgenConfigInputRecord = yield call(
            submitTestgenConfigInputApi,
            action.data.workflowId,
            action.data.testgenConfigId,
            action.data.configInput
        );
        const mappedTestgenConfig = mapTestgenConfigInput(testgenConfigInputRecord);
        yield put(submitTestgenConfigInputSuccess(mappedTestgenConfig));
    } catch (e) {
        console.error(e);
        yield put(submitTestgenConfigInputFailure(e.message));
    }
}

function* fetchTestgenConfigInput(action: ReturnType<typeof fetchTestgenConfigInputAction>) {
    try {
        const testgenConfig = yield call(fetchTestgenConfigInputApi, action.data.workflowId, action.data.testgenConfigId);
        const mappedTestgenConfig = mapTestgenConfigInput(testgenConfig);
        yield put(fetchTestgenConfigInputSuccess(mappedTestgenConfig));
    } catch (e) {
        console.error(e);
        yield put(fetchTestgenConfigInputFailure(e.message));
    }
}

function* fetchSystemByVulnConfig(action: ReturnType<typeof fetchSystemByVulnConfigAction>) {
    try {
        const configurator = yield call(fetchConfiguratatorByVulnConfigApi, action.data.vulnConfigId);
        const mappedConfigurator = mapConfiguratorToSystem(configurator);
        yield put(fetchSystemByVulnConfigSuccess(mappedConfigurator));
    } catch (e) {
        console.error(e);
        yield put(fetchSystemByVulnConfigFailure(e.message));
    }
}

function* cloneWorkflow(action: ReturnType<typeof cloneWorkflowAction>) {
    try {
        const workflow = yield call(cloneWorkflowApi, action.data);
        const mappedWorkflow = mapWorkflow(workflow);
        yield put(cloneWorkflowSuccess(mappedWorkflow));
    } catch (e) {
        console.error(e);
        yield put(cloneWorkflowError(e.message));
    }
}

function* fetchWorkflow(action: ReturnType<typeof fetchWorkflowAction>) {
    try {
        const workflow = yield call(fetchWorkflowApi, action.data);
        const mappedWorkflow = mapWorkflow(workflow);
        yield put(fetchWorkflowSuccess(mappedWorkflow));
    } catch (e) {
        console.error(e);
        yield put(fetchWorkflowError(e.message));
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

function* submitVulnerabilityClass(action: ReturnType<typeof submitVulnerabilityClassAction>) {
    try {
        const configurator = yield call(submitVulnerabilityClassApi, action.data.workflowId, action.data.vulnerabilityClassName);
        const mappedConfigurator = mapUploadConfiguratorToSystem(configurator);
        yield put(submitVulnerabilityClassSuccess(mappedConfigurator));
    } catch (e) {
        console.error(e);
        yield put(submitVulnerabilityClassFailure(e.message));
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

function* updateWorkflow(action: ReturnType<typeof updateWorkflowAction>) {
    try {
        const { id, label } = action.data;
        const workflow = yield call(updateWorkflowApi, id, label);
        const mappedWorkflow = mapWorkflow(workflow);
        yield put(updateWorkflowSuccess(mappedWorkflow));
    } catch (e) {
        console.error(e);
        yield put(updateWorkflowError(e.message));
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

function* triggerReport(action: ReturnType<typeof triggerReportAction>) {
    try {
        // NOTE: the api call to trigger a report does return a report-job payload
        //       but since we are currently running this from the overview page
        //       where we are working with workflows, we ignore that and just re-fetch
        //       the relevant workflow
        yield call(triggerReportApi, action.data.workflowId, action.data.workflowLabel);
        const workflow = yield call(fetchWorkflowApi, action.data.workflowId);
        const mappedWorkflow = mapWorkflow(workflow);
        yield put(triggerReportSuccess(mappedWorkflow));
    } catch (e) {
        console.error(e);
        put(triggerReportError(e.message));
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
    yield takeLatest(ArchExtractActionTypes.LIST_ARCH_EXTRACT, listArchExtract);
    yield takeLatest(ArchExtractActionTypes.FETCH_ARCH_EXTRACT, fetchArchExtract);
    yield takeLatest(ArchExtractActionTypes.NEW_ARCH_EXTRACT, newArchExtract);
    yield takeLatest(ArchExtractActionTypes.SUBMIT_ARCH_EXTRACT, submitArchExtract);
    yield takeLatest(ArchExtractActionTypes.RUN_ARCH_EXTRACT, runArchExtract);
    yield takeLatest(ArchExtractActionTypes.CONVERT_ARCH_EXTRACT, convertArchExtract);
    yield takeLatest(SystemActionTypes.SUBMIT_SYSTEM, submitSystem);
    yield takeLatest(SystemActionTypes.SUBMIT_VULNERABILITY_CLASS, submitVulnerabilityClass);
    yield takeLatest(SystemActionTypes.FETCH_TEST_SYSTEM, fetchSystem);
    yield takeLatest(SystemActionTypes.FETCH_TEST_SYSTEM_BY_VULN, fetchSystemByVulnConfig);
    yield takeLatest(SystemActionTypes.SUBMIT_VALIDATE_CONFIGURATION, submitValidateConfiguration);
    yield takeLatest(TestgenConfigActionTypes.CREATE_TESTGEN_CONFIG_INPUT, createTestgenConfigInput);
    yield takeLatest(TestgenConfigActionTypes.SUBMIT_TESTGEN_CONFIG_INPUT, submitTestgenConfigInput);
    yield takeLatest(TestgenConfigActionTypes.FETCH_TESTGEN_CONFIG_INPUT, fetchTestgenConfigInput);
    yield takeLatest(WorkflowActionTypes.FETCH_WORKFLOWS, fetchWorkflows);
    yield takeLatest(WorkflowActionTypes.FETCH_WORKFLOW, fetchWorkflow);
    yield takeLatest(WorkflowActionTypes.SUBMIT_WORKFLOW, submitWorkflow);
    yield takeLatest(SystemActionTypes.SUBMIT_SYSTEM_CONFIG_INPUT, submitSystemConfigInput);
    yield takeLatest(SystemActionTypes.FETCH_SYSTEM_CONFIG_INPUT, fetchSystemConfigInput);
    yield takeLatest(SystemActionTypes.UPDATE_SYSTEM_CONFIG_INPUT, updateSystemConfigInput);
    yield takeLatest(WorkflowActionTypes.TRIGGER_REPORT, triggerReport);
    yield takeLatest(WorkflowActionTypes.CLONE_WORKFLOW, cloneWorkflow);
    yield takeLatest(WorkflowActionTypes.UPDATE_WORKFLOW, updateWorkflow);
};
