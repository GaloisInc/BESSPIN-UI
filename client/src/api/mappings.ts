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
    const configs = configurator.configs ? configurator.configs.map<ISelectionType>((c: IConfig) => {
        // TOOD: is this correct? do we only need to take the most recent value?
        const mostRecentContent = c;
        return {
            uid: c.uid,
            mode: mapSelectionMode(mostRecentContent.mode),
            other: mostRecentContent.other,
            isValid: mostRecentContent.validated,
        };
    }) : null;

    return {
        uid: configurator.uid,
        createdAt: configurator.date,
        lastUpdate: configurator.last_update,
        featureCount: configurator.nb_features_selected,
        filename: configurator.filename,
        conftree: configurator.conftree,
        ...(configs ? { configs } : null),
    };
};

export const mapConfiguratorsToSystems = (configurators: IConfigurator[]): ISystemMap => {
    return configurators.reduce((configurators: ISystemMap, c: IConfigurator) => ({
        ...configurators,
        [c.uid]: mapConfiguratorToSystem(c),
    }), {});
};

export const mapValidateResponse = (validateResponse: IValidateResponse): IValidateResponse => {
    return validateResponse;
};
