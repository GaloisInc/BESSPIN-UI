import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

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

const request = async (config: AxiosRequestConfig): Promise<AxiosResponse> => {
    return axios
            .request(config)
            .then(trapHTMLError)
            .then(extractData);
};

export const listArchExtract = async () => {
    return request({
        url: 'api/arch-extract/list',
        method: 'get',
        headers: { ...DEFAULT_HEADERS },
        data: {},
    });
};

export const fetchArchExtract = async (archExtractId: number) => {
    return request({
        url: `api/arch-extract/fetch/${archExtractId.toString()}`,
        method: 'get',
        headers: { ...DEFAULT_HEADERS },
        data: {},
    });
};

export const newArchExtract = async (cpuTemplate: string, label: string) => {
    return request({
        url: `api/arch-extract/new/${cpuTemplate}`,
        method: 'post',
        headers: { ...DEFAULT_HEADERS },
        data: { label: label },
    });
};

export const submitArchExtract = async (archExtractId: number, archExtractInput: string) => {
    return request({
        url: `api/arch-extract/submit/${archExtractId.toString()}`,
        method: 'post',
        headers: { ...DEFAULT_HEADERS },
        data: {
            archExtractInput
        },
    });
};

export const runArchExtract = async (archExtractId: number) => {
    return request({
        url: `api/arch-extract/run/${archExtractId.toString()}`,
        method: 'post',
        headers: { ...DEFAULT_HEADERS },
        data: {},
    });
};

export const convertArchExtract = async (archExtractOutputId: number) => {
    return request({
        url: `api/arch-extract/convert/${archExtractOutputId.toString()}`,
        method: 'get',
        headers: { ...DEFAULT_HEADERS },
    });
};

export const listFeatExtract = async () => {
    return request({
        url: 'api/feat-extract/list',
        method: 'get',
        headers: { ...DEFAULT_HEADERS },
        data: {},
    });
};

export const fetchFeatExtract = async (featExtractId: number) => {
    return request({
        url: `api/feat-extract/fetch/${featExtractId.toString()}`,
        method: 'get',
        headers: { ...DEFAULT_HEADERS },
        data: {},
    });
};

export const newFeatExtract = async (cpuTemplate: string, label: string, preBuilt: boolean) => {
    return request({
        url: `api/feat-extract/new/${cpuTemplate}/${preBuilt ? 'preBuilt' : 'notPreBuilt'}`,
        method: 'post',
        headers: { ...DEFAULT_HEADERS },
        data: { label: label },
    });
};

export const submitFeatExtract = async (featExtractId: number, featExtractInput: string) => {
    return request({
        url: `api/feat-extract/submit/${featExtractId.toString()}`,
        method: 'post',
        headers: { ...DEFAULT_HEADERS },
        data: {
            featExtractInput
        },
    });
};

export const runFeatExtract = async (featExtractId: number) => {
    return request({
        url: `api/feat-extract/run/${featExtractId.toString()}`,
        method: 'post',
        headers: { ...DEFAULT_HEADERS },
        data: {},
    });
};

export const simplifyFeatExtract = async (featExtractId: number) => {
    return request({
        url: `api/feat-extract/simplify/${featExtractId.toString()}`,
        method: 'get',
        headers: { ...DEFAULT_HEADERS },
    });
};

export const fetchConfigurator = async (systemUid: string) => {
    return request({
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
    });
};

export const fetchConfiguratorByVulnConfig = async (vulnConfigId: number) => {
    return request({
        url: `/api/vulnerability-config-input/${vulnConfigId}/feature-model`,
        method: 'get',
        headers: {
            ...DEFAULT_HEADERS,
        },
    });
};

export const fetchConfigurators = async () => {
    return request({
        url: '/api/feature-model',
        method: 'get',
        headers: {
            ...DEFAULT_HEADERS,
        }
    });
};

export const cloneWorkflow = async (id: number) => {
    return request({
        url: `/api/workflow/clone/${id}`,
        method: 'get',
        headers: {
            ...DEFAULT_HEADERS,
        },
    });
};

export const fetchWorkflow = async (id: number) => {
    return request({
        url: `/api/workflow/${id}`,
        method: 'get',
        headers: {
            ...DEFAULT_HEADERS,
        },
    });
};

export const fetchWorkflows = async () => {
    return request({
        url: '/api/workflow',
        method: 'get',
        headers: {
            ...DEFAULT_HEADERS,
        },
    });
};

export const updateWorkflow = async (id: number, label: string) => {
    return request({
        url: `/api/workflow/${id}`,
        method: 'put',
        headers: {
            ...DEFAULT_HEADERS,
        },
        data: {
            label,
        },
    });
}

export const submitConfigurator = async (systemName: string, systemJsonAsString: string) => {
    return request({
        url: `/api/feature-model/upload/${systemName}/global_var_cpu`,
        method: 'post',
        headers: {
            ...DEFAULT_HEADERS,
        },
        data: systemJsonAsString,
    });
};

export const submitVulnerabilityClass = async (workflowId: string, vulnClass: string) => {
    return request({
        url: `/api/feature-model/create-vuln-config/${workflowId}/${vulnClass}`,
        method: 'post',
        headers: {
            ...DEFAULT_HEADERS,
        },
        data: {},
    });
};

export const fetchSystemConfigurationInput = async (sysConfigId: number) => {
    return request({
        url: `/api/system-config-input/${sysConfigId}`,
        method: 'get',
        headers: {
            ...DEFAULT_HEADERS,
        },
    });
};

export const submitSystemConfigurationInput = async (config: INewSystemConfigInput) => {
    return request({
        url: `/api/system-config-input`,
        method: 'post',
        headers: {
            ...DEFAULT_HEADERS,
        },
        data: config,
    });
};

export const updateSystemConfigurationInput = async (config: IServersideSysConfigInput) => {
    return request({
        url: `/api/system-config-input/${config.sysConfigId}`,
        method: 'put',
        headers: {
            ...DEFAULT_HEADERS,
        },
        data: config,
    });
};

export const createTestgenConfigInput = async (workflowId: string) => {
    return request({
        url: `/api/testgen-config-input/create/${workflowId}`,
        method: 'get',
        headers: {
            ...DEFAULT_HEADERS,
        },
    });
};

export const submitTestgenConfigInput = async (workflowId: string, testgenConfigId: number, testgenConfigInput: string) => {
    return request({
        url: `/api/testgen-config-input/submit/${workflowId}/${testgenConfigId.toString()}`,
        method: 'post',
        headers: {
            ...DEFAULT_HEADERS,
        },
        data: { configInput: testgenConfigInput },
    });
};

export const fetchTestgenConfigInput = async (workflowId: string, testgenConfigId: number) => {
    return request({
        url: `/api/testgen-config-input/fetch/${workflowId}/${testgenConfigId}`,
        method: 'get',
        headers: {
            ...DEFAULT_HEADERS,
        },
    });
};

export const submitWorkflow = async (workflowLabel: string) => {
    return request({
        url: '/api/workflow',
        method: 'post',
        headers: {
            ...DEFAULT_HEADERS,
        },
        data: {
            label: workflowLabel,
        },
    });
};

export const submitValidateConfiguration = async (uid: string, selectedNodes: IConfig[]) => {
    return request({
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
    });
};

export const triggerReport = async (workflowId: number, workflowLabel: string) => {
    return request({
        url: `/api/report-job`,
        method: 'post',
        headers: {
            ...DEFAULT_HEADERS,
        },
        data: JSON.stringify({
            workflowId,
            label: `report job for ${workflowLabel}`,
        }),
    });
};
