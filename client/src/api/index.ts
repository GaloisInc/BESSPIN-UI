import axios from 'axios';

export interface IConfigurator {
    uid: string,
    filename: string,
    date: string,
    last_update: string,
    nb_features_selected: number;
}

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