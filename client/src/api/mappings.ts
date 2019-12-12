import { ISelectionType, ISystemMap, ISystemEntry, SelectionMode } from "../state/system";
import { IFeatureMap, IFeatureModel } from "../components/graph-helper";

export interface IConfigContent {
    mode: string;
    other: string;
    validated: boolean;
}

export interface IConfig {
    content: IConfigContent;
    uid: string;
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
        const mostRecentContent = c.content;
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
        configsPP: configurator.configs_pp,
        source: configurator.source,
        ...(configs ? { configs } : null),
    };
};

export const mapConfiguratorsToSystems = (configurators: IConfigurator[]): ISystemMap => {
    return configurators.reduce((configurators: ISystemMap, c: IConfigurator) => ({
        ...configurators,
        [c.uid]: mapConfiguratorToSystem(c),
    }), {});
};
