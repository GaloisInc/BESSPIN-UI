import { createSelector } from 'reselect';

export interface IWorkflowError {
  id: number;
  message: string;
}

export enum JobStatus {
    Running = 'running',
    Succeeded = 'succeeded',
    Failed = 'failed',
};

export interface IConfig {
  id: number;
  createdAt: string;
  updatedAt?: string;
  label?: string;
  error?: IWorkflowError;
}

export interface ISystemConfig extends IConfig {
    nixFilename: string;
    nixConfig: string;
}

export interface IVulnerabilityConfig extends IConfig {
    featureModel: string;
}

export interface IReportConfig extends IConfig {
  status: JobStatus;
  log?: string;
}

export interface IWorkflow {
    id: number;
    label: string;
    createdAt: string;
    hasError?: boolean;
    updatedAt?: string;
    systemConfig?: ISystemConfig;
    testConfig?: IVulnerabilityConfig;
    report?: IReportConfig;
}

export interface IWorkflowMap extends Object {
    [id: number]: IWorkflow;
}

export interface IWorkflowState {
    byId: IWorkflowMap;
    ids: number[];
}

export const DEFAULT_STATE: IWorkflowState = {
    byId: {},
    ids: [],
};

// Actions

export enum WorkflowActionTypes {
    FETCH_WORKFLOW = 'workflow/fetch',
    FETCH_WORKFLOW_FAILURE = 'workflow/fetch/error',
    FETCH_WORKFLOW_SUCCESS = 'workflow/fetch/success',
    FETCH_WORKFLOWS = 'workflows/fetch',
    FETCH_WORKFLOWS_FAILURE = 'workflows/fetch/error',
    FETCH_WORKFLOWS_SUCCESS = 'workflows/fetch/success',
    SUBMIT_WORKFLOW = 'workflow/submit',
    SUBMIT_WORKFLOW_FAILURE = 'workflow/submit/error',
    SUBMIT_WORKFLOW_SUCCESS = 'workflow/submit/success',
}

export const fetchWorkflow = (id: number) => {
    return {
        type: WorkflowActionTypes.FETCH_WORKFLOW,
        data: id,
    } as const;
};

export const fetchWorkflowError = (error: string) => {
    return {
        type: WorkflowActionTypes.FETCH_WORKFLOW_FAILURE,
        data: error,
    } as const;
};

export const fetchWorkflowSuccess = (workflow: IWorkflow) => {
    return {
        type: WorkflowActionTypes.FETCH_WORKFLOW_SUCCESS,
        data: workflow,
    } as const;
};

export const fetchWorkflows = () => {
    return {
        type: WorkflowActionTypes.FETCH_WORKFLOWS,
    } as const;
};

export const fetchWorkflowsError = (error: string) => {
    return {
        type: WorkflowActionTypes.FETCH_WORKFLOWS_FAILURE,
        data: error,
    } as const;
};

export const fetchWorkflowsSuccess = (workflows: IWorkflow[]) => {
    return {
        type: WorkflowActionTypes.FETCH_WORKFLOWS_SUCCESS,
        data: workflows,
    } as const;
};

export const submitWorkflow = (newWorkflowLabel: string) => {
    return {
        type: WorkflowActionTypes.SUBMIT_WORKFLOW,
        data: newWorkflowLabel,
    } as const;
};

export const submitWorkflowError = (error: string) => {
    return {
        type: WorkflowActionTypes.SUBMIT_WORKFLOW_FAILURE,
        data: error,
    } as const;
};

export const submitWorkflowSuccess = (workflow: IWorkflow) => {
    return {
        type: WorkflowActionTypes.SUBMIT_WORKFLOW_SUCCESS,
        data: workflow,
    } as const;
};

export type IWorkflowAction = ReturnType<
    typeof fetchWorkflow |
    typeof fetchWorkflowError |
    typeof fetchWorkflowSuccess |
    typeof fetchWorkflows |
    typeof fetchWorkflowsError |
    typeof fetchWorkflowsSuccess |
    typeof submitWorkflow |
    typeof submitWorkflowError |
    typeof submitWorkflowSuccess
>;

// Reducers

const uniquifyIds = (ids: number[]): number[] => {
    return ids.sort().reduce((acc: number[], id: number) => {
        return acc.includes(id) ? acc : acc.concat(id);
    }, []);
};

export const reducer = (state = DEFAULT_STATE, action: IWorkflowAction) => {
    switch (action.type) {
        case WorkflowActionTypes.FETCH_WORKFLOWS_SUCCESS:
            const byId: IWorkflowMap = action.data.reduce((acc, workflow) => {
                return {
                    ...acc,
                    [workflow.id]: workflow,
                };
            }, state.byId);
            const newIds: number[] = Object.keys(byId).sort().map(id => Number(id));
            return {
                ...state,
                byId,
                ids: uniquifyIds(state.ids.concat(newIds)),
            };
        case WorkflowActionTypes.FETCH_WORKFLOW_SUCCESS:
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [action.data.id]: action.data,
                },
                ids: uniquifyIds(state.ids.concat([action.data.id])),
            }
        case WorkflowActionTypes.SUBMIT_WORKFLOW_SUCCESS:
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [action.data.id]: action.data,
                },
                ids: state.ids.concat(action.data.id),
            };
        default:
            return state;
    }
}

// Selectors

interface IState {
    workflow: IWorkflowState;
}

export const getWorkflowState = (state: IState) => state.workflow;

export const getWorkflowsMap = createSelector(
    [getWorkflowState],
    (workflowState: IWorkflowState) => workflowState.byId,
);

export const getWorkflowIds = createSelector(
    [getWorkflowState],
    (workflowState: IWorkflowState) => workflowState.ids,
);

export const getWorkflowById = (state: IState, id: number): IWorkflow | null => {
    const workflowsById = getWorkflowsMap(state);
    return workflowsById[id] || null;
};
