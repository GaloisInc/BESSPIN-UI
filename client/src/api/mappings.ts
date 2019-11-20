import { ISystemMap, ISystemEntry } from "../state/system";
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

export const mapConfiguratorToSystem = (configurator: IConfigurator): ISystemEntry => {
    return {
        uid: configurator.uid,
        createdAt: configurator.date,
        lastUpdate: configurator.last_update,
        featureCount: configurator.nb_features_selected,
        filename: configurator.filename,
        conftree: configurator.conftree,
    };
};

export const mapConfiguratorsToSystems = (configurators: IConfigurator[]): ISystemMap => {
    return configurators.reduce((configurators: ISystemMap, c: IConfigurator) => ({
        ...configurators,
        [c.uid]: mapConfiguratorToSystem(c),
    }), {});
};
