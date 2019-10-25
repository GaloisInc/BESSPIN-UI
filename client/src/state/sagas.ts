import {
	call,
	put,
	takeLatest,
} from 'redux-saga/effects';

import {
    fetchConfigurators,
} from '../api';

import {
    mapConfiguratorsToSystems,
} from '../api/mappings';

import {
    SystemActionTypes,
    fetchSystemsFailure,
    fetchSystemsSuccess,
} from './system';

function* fetchSystems() {
    try {
        const configurators = yield call(fetchConfigurators);
        const mappedConfigurators = mapConfiguratorsToSystems(configurators);
		yield put(fetchSystemsSuccess(mappedConfigurators));
    } catch(e) {
        console.error(e);
        yield put(fetchSystemsFailure(e.message));
    }
}

export function* rootSaga() {
    yield takeLatest(SystemActionTypes.FETCH_TEST_SYSTEMS, fetchSystems);
};