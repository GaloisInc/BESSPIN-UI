import {
	call,
	put,
	takeLatest,
} from 'redux-saga/effects';

import {
    fetchConfigurators,
    submitConfigurator,
} from '../api';

import {
    mapConfiguratorsToSystems,
} from '../api/mappings';

import {
    fetchSystemsFailure,
    fetchSystemsSuccess,
    submitSystemFailure,
    submitSystemSuccess,
    SystemActionTypes,
    submitSystem as submitSystemAction,
} from './system';

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
        const response = yield call(submitConfigurator, action.data.systemName, action.data.systemJsonString);
        console.log(response);
        yield put(submitSystemSuccess());
    } catch (e) {
        console.error(e);
        yield put(submitSystemFailure(e.message));
    }
}

// Register all the actions that should trigger our sagas
export function* rootSaga() {
    yield takeLatest(SystemActionTypes.SUBMIT_TEST_SYSTEM, submitSystem);
    yield takeLatest(SystemActionTypes.FETCH_TEST_SYSTEMS, fetchSystems);
};
