
export interface ITestgenConfigInputRecord {
    label: string;
    testgenConfigId: number;
    createdAt: string;
    updatedAt?: string;
    workflowId: number;
    configInput: string;
}

export interface ITestgenConfigInputState {
    testgenConfigInput?: ITestgenConfigInputRecord;
}

export const DEFAULT_STATE: ITestgenConfigInputState = {}


export enum TestgenConfigActionTypes {
    CREATE_TESTGEN_CONFIG_INPUT = 'testgen-config/create',
    CREATE_TESTGEN_CONFIG_INPUT_SUCCESS = 'testgen-config/create/success',
    CREATE_TESTGEN_CONFIG_INPUT_FAILURE = 'testgen-config/create/failure',
    SUBMIT_TESTGEN_CONFIG_INPUT = 'testgen-config/submit',
    SUBMIT_TESTGEN_CONFIG_INPUT_SUCCESS = 'testgen-config/submit/success',
    SUBMIT_TESTGEN_CONFIG_INPUT_FAILURE = 'testgen-config/submit/failure',
    FETCH_TESTGEN_CONFIG_INPUT = 'testgen-config/fetch',
    FETCH_TESTGEN_CONFIG_INPUT_SUCCESS = 'testgen-config/fetch/success',
    FETCH_TESTGEN_CONFIG_INPUT_FAILURE = 'testgen-config/fetch/failure',
}

export const createTestgenConfigInput = (workflowId: string) => {
    return {
        type: TestgenConfigActionTypes.CREATE_TESTGEN_CONFIG_INPUT,
        data: {
            workflowId,
        }
    } as const;
}

export const createTestgenConfigInputSuccess = (record: ITestgenConfigInputRecord) => {
    return {
        type: TestgenConfigActionTypes.CREATE_TESTGEN_CONFIG_INPUT_SUCCESS,
        data: { record },
    } as const;
}

export const createTestgenConfigInputFailure = (error: string) => {
    return {
        type: TestgenConfigActionTypes.CREATE_TESTGEN_CONFIG_INPUT_FAILURE,
        data: { error },
    } as const;
}

export const submitTestgenConfigInput = (workflowId: string, testgenConfigId: number, configInput: string) => {
    return {
        type: TestgenConfigActionTypes.SUBMIT_TESTGEN_CONFIG_INPUT,
        data: {
            workflowId,
            testgenConfigId,
            configInput,
        }
    } as const;
}
export const submitTestgenConfigInputSuccess = (record: ITestgenConfigInputRecord) => {
    return {
        type: TestgenConfigActionTypes.SUBMIT_TESTGEN_CONFIG_INPUT_SUCCESS,
        data: { record },
    } as const;
}
export const submitTestgenConfigInputFailure = (error: string) => {
    return {
        type: TestgenConfigActionTypes.SUBMIT_TESTGEN_CONFIG_INPUT_FAILURE,
        data: {
            error,
        }
    } as const;
}
export const fetchTestgenConfigInput = (workflowId: string, testgenConfigId: number) => {
    return {
        type: TestgenConfigActionTypes.FETCH_TESTGEN_CONFIG_INPUT,
        data: { workflowId, testgenConfigId }
    } as const;
}
export const fetchTestgenConfigInputSuccess = (record: ITestgenConfigInputRecord) => {
    return {
        type: TestgenConfigActionTypes.FETCH_TESTGEN_CONFIG_INPUT_SUCCESS,
        data: { record },
    } as const;
}
export const fetchTestgenConfigInputFailure = (error: string) => {
    return {
        type: TestgenConfigActionTypes.FETCH_TESTGEN_CONFIG_INPUT_FAILURE,
        data: {
            error,
        }
    } as const;
}

export type ITestgenAction = ReturnType<
    typeof createTestgenConfigInput |
    typeof createTestgenConfigInputSuccess |
    typeof createTestgenConfigInputFailure |
    typeof submitTestgenConfigInput |
    typeof submitTestgenConfigInputSuccess |
    typeof submitTestgenConfigInputFailure |
    typeof fetchTestgenConfigInput |
    typeof fetchTestgenConfigInputSuccess |
    typeof fetchTestgenConfigInputFailure
>;

export const reducerTestgenConfigInput = (state = DEFAULT_STATE, action: ITestgenAction) : ITestgenConfigInputState => {
    switch (action.type) {
        case TestgenConfigActionTypes.CREATE_TESTGEN_CONFIG_INPUT_SUCCESS:
        case TestgenConfigActionTypes.SUBMIT_TESTGEN_CONFIG_INPUT_SUCCESS:
        case TestgenConfigActionTypes.FETCH_TESTGEN_CONFIG_INPUT_SUCCESS:
            return {
                ...state,
                testgenConfigInput: action.data.record,
            }
        default:
            return state;
    }
};

interface IState {
    testgenConfigInput: ITestgenConfigInputState;
}

export const getTestgenConfigInput = (state: IState) =>
    state.testgenConfigInput.testgenConfigInput ?
    state.testgenConfigInput.testgenConfigInput.configInput :
    '';

export const getTestgenConfigInputId = (state: IState) =>
    state.testgenConfigInput.testgenConfigInput ?
    state.testgenConfigInput.testgenConfigInput.testgenConfigId :
    undefined;
