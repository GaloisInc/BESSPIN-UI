import axios from 'axios';

export const fetchConfigurators = async () => {
    return axios.request({
        url: '/configurator/list_db_models/',
        method: 'get',
        headers: {
            'content-type': 'application/json',
            accept: 'application/json',
        }
    })
    .then(response => response.data);
};

export const submitConfigurator = async (systemName: string, systemJsonAsString: string) => {
    return axios.request({
        url: `/configurator/upload/${systemName}/global_var_cpu`,
        method: 'post',
        headers: {
            'content-type': 'application/json',
            accept: 'application/json',
        },
        data: systemJsonAsString,
    })
    .then(response => response.data);
}