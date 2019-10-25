import { IConfigurator } from ".";
import { ISystemEntry } from "../state/system";

export const mapConfiguratorsToSystems = (configurators: IConfigurator[]): ISystemEntry[] => {
    return configurators.map((c: IConfigurator) => ({
        hash: c.uid,
        createdAt: c.date,
        lastUpdate: c.last_update,
        featureCount: c.nb_features_selected,
        filename: c.filename,
    }));
};
