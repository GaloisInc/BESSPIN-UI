import { ISelectionType, ValidateResult, ISystemEntry, SelectionMode, ISystemConfigInput } from '../state/system';
import { IFeatureMap, IFeatureModel } from '../components/graph-helper';
import { IWorkflow, JobStatus } from '../state/workflow';


export interface IConfig {
    uid: string;
    mode: string;
    other: string;
    validated: boolean;
}

/* eslint-disable camelcase */
export interface IConfigurator {
    uid: string,
    filename: string,
    date: string,
    last_update: string,
    nb_features_selected: number,
    configs: IConfig[],
    configs_pp: string,
    configured_feature_model: IFeatureMap,
    conftree: IFeatureModel,
    source: string,
}

export interface IUploadResponse {
    uid: string,
    tree: IFeatureModel,
    configured_feature_model: IFeatureMap,
    source: string,
}

export interface IValidateResponse {
    server_source: string,
    server_constraints: string,
    validated_features: IConfig[],
    configured_feature_model: IFeatureModel,
}

export interface IServersideSysConfigInput {
    sysConfigId: number;
    workflowId: number;
    label: string;
    createdAt: string;
    updatedAt?: string;
    nixConfigFilename: string;
    nixConfig: string;
}

export interface IServersideWorkflow {
    workflowId: number;
    label: string;
    createdAt: string;
    updatedAt?: string;
    systemConfigurationInput?: IServersideSysConfigInput;
    testConfigId?: number;
    reportId?: number;
    report?: {
        id: number;
        status: JobStatus;
    }
}

/* eslint-enable camelcase */

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
        configsPP: configurator.configs_pp,
        source: configurator.source,
        configs:
            // TODO this boolean expression is for backward compatibility
            // Should remove it eventually
            configurator.configs ?
            configurator.configs.map(mapIConfigToISelectionType):
            [],
        selectionUndos: [],
    };
};

export const mapUploadConfiguratorToSystem = (configurator: IUploadResponse): ISystemEntry => {
    return {
        uid: configurator.uid,
        source: configurator.source,
        createdAt: "",
        lastUpdate: "",
        featureCount: -1,
        filename: "",
        conftree: configurator.tree,
        configs: [],
        selectionUndos: [],
    };
};

const mapIConfigToISelectionType = (c: IConfig): ISelectionType => {
    return {
        uid: c.uid,
        mode: mapSelectionMode(c.mode),
        other: c.other,
        isValid: c.validated,
    }

}

export const mapSystemConfigInput = (config: IServersideSysConfigInput): ISystemConfigInput => {
    return {
        id: config.sysConfigId,
        workflowId: config.workflowId,
        label: config.label,
        createdAt: config.createdAt,
        nixConfigFilename: config.nixConfigFilename,
        nixConfig: config.nixConfig,
        ...(config.updatedAt ? { updatedAt: config.updatedAt } : null),
    };
};

export const mapSystemConfigInputToServerside = (config: ISystemConfigInput): IServersideSysConfigInput => {
    return {
        sysConfigId: config.id,
        workflowId: config.workflowId,
        label: config.label,
        createdAt: config.createdAt,
        nixConfig: config.nixConfig,
        nixConfigFilename: config.nixConfigFilename,
    };
};

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

export const mapValidateResponse = (validateResponse: IValidateResponse): ValidateResult => {
    return {
        serverSource: validateResponse.server_source,
        serverConstraints: validateResponse.server_constraints,
        validatedFeatures: validateResponse.validated_features.map(mapIConfigToISelectionType),
        configuredFeatureModel: validateResponse.configured_feature_model,
    };
};

export const mapWorkflow = (workflow: IServersideWorkflow): IWorkflow => {
    return {
        id: workflow.workflowId,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt,
        label: workflow.label,
        ...(workflow.systemConfigurationInput && workflow.systemConfigurationInput.sysConfigId ? {
            systemConfig: { id: workflow.systemConfigurationInput.sysConfigId, },
        } : null),
        ...(workflow.testConfigId ? {
            testConfig: { id: workflow.testConfigId, },
        } : null),
        ...(workflow.reportId && workflow.report?.status ? {
            report: { id: workflow.reportId, status: workflow.report.status },
        } : null),
    };
};

export const mapWorkflows = (workflows: IServersideWorkflow[]): IWorkflow[] => {
    return workflows.map(mapWorkflow);
};
