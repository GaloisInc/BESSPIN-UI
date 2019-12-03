import {
	call,
	put,
	takeLatest,
} from 'redux-saga/effects';

import {
    fetchConfigurator,
    fetchConfigurators,
    submitConfigurator,
} from '../api/api';

import {
    mapConfiguratorToSystem,
    mapConfiguratorsToSystems,
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
} from './system';

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

function* submitSystem(action: ReturnType<typeof submitSystemAction>) {
    try {
        const configurator = yield call(submitConfigurator, action.data.systemName, action.data.systemJsonString);
        console.log(configurator);
        const mappedConfigurator = mapConfiguratorToSystem(configurator);
        yield put(submitSystemSuccess(mappedConfigurator));

        yield call(fetchSystems);
    } catch (e) {
        console.error(e);
        yield put(submitSystemFailure(e.message));
    }
}

// Register all the actions that should trigger our sagas
export function* rootSaga() {
    yield takeLatest(SystemActionTypes.SUBMIT_TEST_SYSTEM, submitSystem);
    yield takeLatest(SystemActionTypes.FETCH_TEST_SYSTEMS, fetchSystems);
    yield takeLatest(SystemActionTypes.FETCH_TEST_SYSTEM, fetchSystem);
};
