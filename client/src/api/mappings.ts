import { ISelectionType, ISystemMap, ISystemEntry, SelectionMode } from "../state/system";
import { IFeatureMap, IFeatureModel } from "../components/graph-helper";


export interface IConfig {
    uid: string;
    mode: string;
    other: string;
    validated: boolean;
}

export interface IConfigurator {
    uid: string,
    filename: string,
    date: string,
    last_update: string,
    nb_features_selected: number;
    configs: IConfig[];
    configs_pp: string;
    configured_feature_model: IFeatureMap;
    conftree: IFeatureModel;
    source: string;
}

export interface IValidateResponse {
    server_source: string,
    server_constraints: string,
    validated_features: ISelectionType[],
    configured_feature_model: IFeatureMap,
}

const mapSelectionMode = (mode: string): SelectionMode => {
    switch (mode) {
        case 'selected':
            return SelectionMode.selected;
        case 'rejected':
            return SelectionMode.rejected;
        case 'unselected':
            return SelectionMode.unselected;
        default:
            console.error(`Unknown selection mode "${mode}"`);
            return SelectionMode.unselected;
    }
};

export const mapConfiguratorToSystem = (configurator: IConfigurator): ISystemEntry => {
    return {
        uid: configurator.uid,
        createdAt: configurator.date,
        lastUpdate: configurator.last_update,
        featureCount: configurator.nb_features_selected,
        filename: configurator.filename,
        conftree: configurator.conftree,
        configs: configurator.configs.map(mapIConfigToISelectionType),
    };
};

export const mapConfiguratorsToSystems = (configurators: IConfigurator[]): ISystemMap => {
    return configurators.reduce((configurators: ISystemMap, c: IConfigurator) => ({
        ...configurators,
        [c.uid]: mapConfiguratorToSystem(c),
    }), {});
};

const mapIConfigToISelectionType = (c: IConfig): ISelectionType => {
    return {
        uid: c.uid,
        mode: mapSelectionMode(c.mode),
        other: c.other,
        isValid: c.validated,
    }

}

export const mapValidateRequestForServer = (validateRequest: ISelectionType[]): IConfig[] => {
    const configs = validateRequest.map<IConfig>((c: ISelectionType) => {
        return {
            uid: c.uid,
            mode: mapSelectionMode(c.mode),
            other: c.other,
            validated: c.isValid,
        };
    });

    return configs;
};

export const mapValidateResponse = (validateResponse: IValidateResponse): IValidateResponse => {
    return validateResponse;
};
