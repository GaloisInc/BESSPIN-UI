import { createSelector } from 'reselect';

export interface IWorkflowError {
  id: number;
  message: string;
}

export enum JobStatus {
    Running = 'Running',
    Complete = 'Complete',
};

export interface IConfig {
  id: number;
  error?: IWorkflowError;
}

export interface IReportConfig extends IConfig {
  status: JobStatus;
}

export interface IWorkflow {
    id: number;
    label: string;
    createdAt: string;
    hasError?: boolean;
    updatedAt?: string;
    systemConfig?: IConfig;
    testConfig?: IConfig;
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
    FETCH_WORKFLOWS = 'workflows/fetch',
    FETCH_WORKFLOWS_FAILURE = 'workflows/fetch/error',
    FETCH_WORKFLOWS_SUCCESS = 'workflows/fetch/success',
    SUBMIT_WORKFLOW = 'workflow/submit',
    SUBMIT_WORKFLOW_FAILURE = 'workflow/submit/error',
    SUBMIT_WORKFLOW_SUCCESS = 'workflow/submit/success',
}

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
        payload: workflows,
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
        payload: workflow,
    } as const;
};

export type IWorkflowAction = ReturnType<
    typeof fetchWorkflows |
    typeof fetchWorkflowsError |
    typeof fetchWorkflowsSuccess |
    typeof submitWorkflow |
    typeof submitWorkflowError |
    typeof submitWorkflowSuccess
>;

// Reducers

export const reducer = (state = DEFAULT_STATE, action: IWorkflowAction) => {
    switch (action.type) {
        case WorkflowActionTypes.FETCH_WORKFLOWS_SUCCESS:
            const byId: IWorkflowMap = action.payload.reduce((acc, workflow) => {
                return {
                    ...acc,
                    [workflow.id]: workflow,
                };
            }, state.byId);
            const newIds: number[] = Object.keys(byId).sort().map(id => Number(id));
            return {
                ...state,
                byId,
                ids: state.ids.concat(newIds).sort().reduce((acc: number[], id: number) => {
                    return acc.includes(id) ? acc : acc.concat(id);
                }, []),
            };
        case WorkflowActionTypes.SUBMIT_WORKFLOW_SUCCESS:
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [action.payload.id]: action.payload,
                },
                ids: state.ids.concat(action.payload.id),
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
