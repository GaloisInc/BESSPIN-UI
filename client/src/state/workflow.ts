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

export interface IUpdateWorkflow {
    id: number;
    label: string;
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
    CLONE_WORKFLOW = 'workflow/clone',
    CLONE_WORKFLOW_FAILURE = 'workflow/clone/error',
    CLONE_WORKFLOW_SUCCESS = 'workflow/clone/success',
    FETCH_WORKFLOW = 'workflow/fetch',
    FETCH_WORKFLOW_FAILURE = 'workflow/fetch/error',
    FETCH_WORKFLOW_SUCCESS = 'workflow/fetch/success',
    FETCH_WORKFLOWS = 'workflows/fetch',
    FETCH_WORKFLOWS_FAILURE = 'workflows/fetch/error',
    FETCH_WORKFLOWS_SUCCESS = 'workflows/fetch/success',
    SUBMIT_WORKFLOW = 'workflow/submit',
    SUBMIT_WORKFLOW_FAILURE = 'workflow/submit/error',
    SUBMIT_WORKFLOW_SUCCESS = 'workflow/submit/success',
    TRIGGER_REPORT = 'workflow/trigger-report',
    TRIGGER_REPORT_FAILURE = 'workflow/trigger-report/error',
    TRIGGER_REPORT_SUCCESS = 'workflow/trigger-report/success',
    UPDATE_WORKFLOW = 'workflow/update',
    UPDATE_WORKFLOW_FAILURE = 'workflow/update/error',
    UPDATE_WORKFLOW_SUCCESS = 'workflow/update/success',
}

export const cloneWorkflow = (id: number) => {
    return {
        type: WorkflowActionTypes.CLONE_WORKFLOW,
        data: id,
    } as const;
};

export const cloneWorkflowError = (error: string) => {
    return {
        type: WorkflowActionTypes.CLONE_WORKFLOW_FAILURE,
        data: error,
    } as const;
};

export const cloneWorkflowSuccess = (workflow: IWorkflow) => {
    return {
        type: WorkflowActionTypes.CLONE_WORKFLOW_SUCCESS,
        data: workflow,
    } as const;
};

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

export const updateWorkflow = (workflow: IUpdateWorkflow) => {
    return {
        type: WorkflowActionTypes.UPDATE_WORKFLOW,
        data: {
            ...workflow,
        },
    } as const;
};

export const updateWorkflowError = (error: string) => {
    return {
        type: WorkflowActionTypes.UPDATE_WORKFLOW_FAILURE,
        data: error,
    } as const;
};

export const updateWorkflowSuccess = (workflow: IWorkflow) => {
    return {
        type: WorkflowActionTypes.UPDATE_WORKFLOW_SUCCESS,
        data: workflow,
    } as const;
};

export const triggerReport = (workflowId: number, workflowLabel: string) => {
    return {
        type: WorkflowActionTypes.TRIGGER_REPORT,
        data: {
            workflowId,
            workflowLabel,
        },
    } as const;
};

export const triggerReportError = (error: string) => {
    return {
        type: WorkflowActionTypes.TRIGGER_REPORT_FAILURE,
        data: error,
    } as const;
};

export const triggerReportSuccess = (workflow: IWorkflow) => {
    return {
        type: WorkflowActionTypes.TRIGGER_REPORT_SUCCESS,
        data: workflow,
    } as const;
};

export type IWorkflowAction = ReturnType<
    typeof cloneWorkflow |
    typeof cloneWorkflowError |
    typeof cloneWorkflowSuccess |
    typeof fetchWorkflow |
    typeof fetchWorkflowError |
    typeof fetchWorkflowSuccess |
    typeof fetchWorkflows |
    typeof fetchWorkflowsError |
    typeof fetchWorkflowsSuccess |
    typeof submitWorkflow |
    typeof submitWorkflowError |
    typeof submitWorkflowSuccess |
    typeof triggerReport |
    typeof triggerReportError |
    typeof triggerReportSuccess | 
    typeof updateWorkflow |
    typeof updateWorkflowError |
    typeof updateWorkflowSuccess
>;

// Reducers

const uniquifyIds = (ids: number[]): number[] => {
    const sortDescByNumericValue = (a: number, b: number): number => {
        return a > b   ? -1 :
               a === b ?  0 : 1
    };
    return ids.sort(sortDescByNumericValue).reduce((acc: number[], id: number) => {
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
        case WorkflowActionTypes.TRIGGER_REPORT_SUCCESS:
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [action.data.id]: action.data,
                },
                ids: uniquifyIds(state.ids.concat([action.data.id])),
            }
        case WorkflowActionTypes.SUBMIT_WORKFLOW_SUCCESS:
        case WorkflowActionTypes.CLONE_WORKFLOW_SUCCESS:
        case WorkflowActionTypes.UPDATE_WORKFLOW_SUCCESS:
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [action.data.id]: action.data,
                },
                ids: uniquifyIds(state.ids.concat(action.data.id)),
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

// NOTE: this is not a standard selector from the perspective of reselect
//       since it takes an argument.
//       Not sure if needed, but there is a recommended implementation
//       that continues to leverage reselect's memoization:
//       https://github.com/reduxjs/reselect/blob/master/README.md#q-how-do-i-create-a-selector-that-takes-an-argument
export const getWorkflowById = (state: IState, id: number): IWorkflow | null => {
    const workflowsById = getWorkflowsMap(state);
    return workflowsById[id] || null;
};
