import axios, { AxiosResponse } from 'axios';

import {
    IConfig,
    IServersideSysConfigInput,
} from '../api/mappings';

import {
    INewSystemConfigInput,
} from '../state/feature-model';

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
        url: '/api/feature-model/fetch-by-uid',
        method: 'post',
        headers: {
            ...DEFAULT_HEADERS,
        },
        /* eslint-disable camelcase */
        data: {
            model_uid: systemUid,
        },
        /* eslint-enable camelcase */
    })
    .then(trapHTMLError)
    .then(extractData);
};

export const fetchConfigurators = async () => {
    return axios.request({
        url: '/api/feature-model',
        method: 'get',
        headers: {
            ...DEFAULT_HEADERS,
        }
    })
    .then(trapHTMLError)
    .then(extractData);
};

export const fetchWorkflow = async (id: number) => {
    return axios.request({
        url: `/api/workflow/${id}`,
        method: 'get',
        headers: {
            ...DEFAULT_HEADERS,
        },
    })
    .then(trapHTMLError)
    .then(extractData);
}

export const fetchWorkflows = async () => {
    return axios.request({
        url: '/api/workflow',
        method: 'get',
        headers: {
            ...DEFAULT_HEADERS,
        },
    })
    .then(trapHTMLError)
    .then(extractData);
}

export const submitConfigurator = async (systemName: string, systemJsonAsString: string) => {
    return axios.request({
        url: `/api/feature-model/upload/${systemName}/global_var_cpu`,
        method: 'post',
        headers: {
            ...DEFAULT_HEADERS,
        },
        data: systemJsonAsString,
    })
    .then(trapHTMLError)
    .then(extractData);
}

export const submitVulnerabilityClass = async (workflowId: string, vulnClass: string) => {
    return axios.request({
        url: `/api/feature-model/create-test/${workflowId}/${vulnClass}`,
        method: 'post',
        headers: {
            ...DEFAULT_HEADERS,
        },
        /* eslint-disable camelcase */
        data: {},
        /* eslint-enable camelcase */
    })
    .then(trapHTMLError)
    .then(extractData);
};

export const fetchSystemConfigurationInput = async (sysConfigId: number) => {
    return axios.request({
        url: `/api/system-config-input/${sysConfigId}`,
        method: 'get',
        headers: {
            ...DEFAULT_HEADERS,
        },
    })
    .then(trapHTMLError)
    .then(extractData);
};

export const submitSystemConfigurationInput = async (config: INewSystemConfigInput) => {
    return axios.request({
        url: `/api/system-config-input`,
        method: 'post',
        headers: {
            ...DEFAULT_HEADERS,
        },
        data: config,
    })
    .then(trapHTMLError)
    .then(extractData);
};

export const updateSystemConfigurationInput = async (config: IServersideSysConfigInput) => {
    return axios.request({
        url: `/api/system-config-input/${config.sysConfigId}`,
        method: 'put',
        headers: {
            ...DEFAULT_HEADERS,
        },
        data: config,
    })
    .then(trapHTMLError)
    .then(extractData);
}

export const submitWorkflow = async (workflowLabel: string) => {

    return axios.request({
        url: '/api/workflow',
        method: 'post',
        headers: {
            ...DEFAULT_HEADERS,
        },
        data: {
            label: workflowLabel,
        },
    })
    .then(trapHTMLError)
    .then(extractData);
};

export const submitValidateConfiguration = async (uid: string, selectedNodes: IConfig[]) => {
    return axios.request({
        url: '/api/feature-model/configure',
        method: 'post',
        headers: {
            ...DEFAULT_HEADERS,
        },
        /* eslint-disable camelcase */
        data: JSON.stringify({
            uid: uid,
            feature_selection: selectedNodes,
        }),
        /* eslint-enable camelcase */
    })
    .then(trapHTMLError)
    .then(extractData);
};

export const triggerReport = async (workflowId: number, workflowLabel: string) => {
    return axios.request({
        url: `/api/report-job`,
        method: 'post',
        headers: {
            ...DEFAULT_HEADERS,
        },
        data: JSON.stringify({
            workflowId,
            label: `report job for ${workflowLabel}`,
        }),
    })
    .then(trapHTMLError)
    .then(extractData);  
}
