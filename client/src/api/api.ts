import axios, { AxiosResponse } from 'axios';

import {
    IConfig,
} from '../api/mappings';

const trapHTMLError = (response: AxiosResponse) => {
    if (response.headers && response.headers['Content-type'] === 'text/html') {
        throw new Error('Server errored with HTML. Check server logs for details');
    } else {
        return response;
    }
};

const extractData = (response: AxiosResponse) => {
    return response.data;
};

// Flask will return HTML response unless you specify you want
// JSON, so we set these headers on all requests
const DEFAULT_HEADERS = {
    'content-type': 'application/json',
    accept: 'application/json',
};

export const fetchConfigurator = async (systemUid: string) => {
    return axios.request({
        url: '/api/configurator/load_from_db/',
        method: 'post',
        headers: {
            ...DEFAULT_HEADERS,
        },
        data: {
            model_uid: systemUid,
        },
    })
    .then(trapHTMLError)
    .then(extractData);
};

export const fetchConfigurators = async () => {
    return axios.request({
        url: '/api/configurator/list_db_models/',
        method: 'get',
        headers: {
            ...DEFAULT_HEADERS,
        }
    })
    .then(trapHTMLError)
    .then(extractData);
};

export const submitConfigurator = async (systemName: string, systemJsonAsString: string) => {
    return axios.request({
        url: `/api/configurator/upload/${systemName}/global_var_cpu`,
        method: 'post',
        headers: {
            ...DEFAULT_HEADERS,
        },
        data: systemJsonAsString,
    })
    .then(trapHTMLError)
    .then(extractData);
}

export const submitValidateConfiguration = async (uid: string, selected_nodes: IConfig[]) => {
    return axios.request({
        url: '/api/configurator/configure/',
        method: 'post',
        headers: {
            ...DEFAULT_HEADERS,
        },
        data: JSON.stringify({
            uid: uid,
            feature_selection: selected_nodes,
        }),
    })
    .then(trapHTMLError)
    .then(extractData);
};
