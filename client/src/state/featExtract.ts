export interface IFeatExtractRecord {
    featExtractId: number;
    featExtractInput: string;
    featExtractOutputFilename?: string,
    featExtractOutputContent?: string,
    featExtractOutputContentClafer?: string,
    featExtractOutputFilenameSimplified?: string,
    featExtractOutputContentSimplified?: string,
    featExtractOutputContentClaferSimplified?: string,
}

export interface IFeatExtractListElem {
    featExtractId: number,
    label: string,
};

export interface IFeatExtractState {
    featExtractIdList?: IFeatExtractListElem[];
    featExtractRecord: IFeatExtractRecord;
}

export const DEFAULT_STATE: IFeatExtractState = {
    featExtractRecord: {
        featExtractId: -42,
        featExtractInput: "",
    }
}


export enum FeatExtractActionTypes {
    LIST_FEAT_EXTRACT = 'feat-extract/list',
    LIST_FEAT_EXTRACT_SUCCESS = 'feat-extract/list/success',
    LIST_FEAT_EXTRACT_FAILURE = 'feat-extract/list/failure',
    FETCH_FEAT_EXTRACT = 'feat-extract/fetch',
    FETCH_FEAT_EXTRACT_SUCCESS = 'feat-extract/fetch/success',
    FETCH_FEAT_EXTRACT_FAILURE = 'feat-extract/fetch/failure',
    NEW_FEAT_EXTRACT = 'feat-extract/new',
    NEW_FEAT_EXTRACT_SUCCESS = 'feat-extract/new/success',
    NEW_FEAT_EXTRACT_FAILURE = 'feat-extract/new/failure',
    SUBMIT_FEAT_EXTRACT = 'feat-extract/submit',
    SUBMIT_FEAT_EXTRACT_SUCCESS = 'feat-extract/submit/success',
    SUBMIT_FEAT_EXTRACT_FAILURE = 'feat-extract/submit/failure',
    RUN_FEAT_EXTRACT = 'feat-extract/run',
    RUN_FEAT_EXTRACT_SUCCESS = 'feat-extract/run/success',
    RUN_FEAT_EXTRACT_FAILURE = 'feat-extract/run/failure',
    SIMPLIFY_FEAT_EXTRACT = 'feat-extract/simplify',
    SIMPLIFY_FEAT_EXTRACT_SUCCESS = 'feat-extract/simplify/success',
    SIMPLIFY_FEAT_EXTRACT_FAILURE = 'feat-extract/simplify/failure',
}

export const listFeatExtract = () => {
    return {
        type: FeatExtractActionTypes.LIST_FEAT_EXTRACT,
        data: {}
    } as const;
}

export const listFeatExtractSuccess = (featExtractIdList: IFeatExtractListElem[]) => {
    return {
        type: FeatExtractActionTypes.LIST_FEAT_EXTRACT_SUCCESS,
        data: { featExtractIdList }
    } as const;
}

export const listFeatExtractFailure = (error: string) => {
    return {
        type: FeatExtractActionTypes.LIST_FEAT_EXTRACT_FAILURE,
        data: error
    } as const;
}

export const fetchFeatExtract = (featExtractId: number) => {
    return {
        type: FeatExtractActionTypes.FETCH_FEAT_EXTRACT,
        data: { featExtractId }
    } as const;
}

export const fetchFeatExtractSuccess = (featExtractRecord: IFeatExtractRecord) => {
    return {
        type: FeatExtractActionTypes.FETCH_FEAT_EXTRACT_SUCCESS,
        data: { featExtractRecord }
    } as const;
}

export const fetchFeatExtractFailure = (error: string) => {
    return {
        type: FeatExtractActionTypes.FETCH_FEAT_EXTRACT_FAILURE,
        data: error
    } as const;
}


export const newFeatExtract = (cpuTemplate: string, label: string, preBuilt: boolean) => {
    return {
        type: FeatExtractActionTypes.NEW_FEAT_EXTRACT,
        data: { cpuTemplate, label, preBuilt }
    } as const;
}

export const newFeatExtractSuccess = (featExtractRecord: IFeatExtractRecord) => {
    return {
        type: FeatExtractActionTypes.NEW_FEAT_EXTRACT_SUCCESS,
        data: { featExtractRecord }
    } as const;
}

export const newFeatExtractFailure = (error: string) => {
    return {
        type: FeatExtractActionTypes.NEW_FEAT_EXTRACT_FAILURE,
        data: error
    } as const;
}

export const submitFeatExtract = (featExtractId: number, featExtractInput: string) => {
    return {
        type: FeatExtractActionTypes.SUBMIT_FEAT_EXTRACT,
        data: {
            featExtractId,
            featExtractInput,
        }
    } as const;
}

export const submitFeatExtractSuccess = (featExtractInput: string) => {
    return {
        type: FeatExtractActionTypes.SUBMIT_FEAT_EXTRACT_SUCCESS,
        data: { featExtractInput }
    } as const;
}

export const submitFeatExtractFailure = (error: string) => {
    return {
        type: FeatExtractActionTypes.SUBMIT_FEAT_EXTRACT_FAILURE,
        data: error
    } as const;
}

export const runFeatExtract = (featExtractId: number) => {
    return {
        type: FeatExtractActionTypes.RUN_FEAT_EXTRACT,
        data: { featExtractId },
    } as const;
}

export const runFeatExtractSuccess = (featExtractRecord: IFeatExtractRecord) => {
    return {
        type: FeatExtractActionTypes.RUN_FEAT_EXTRACT_SUCCESS,
        data: { featExtractRecord }
    } as const;
}

export const runFeatExtractFailure = (error: string) => {
    return {
        type: FeatExtractActionTypes.RUN_FEAT_EXTRACT_FAILURE,
        data: error
    } as const;
}

export const simplifyFeatExtract = (featExtractId: number) => {
    return {
        type: FeatExtractActionTypes.SIMPLIFY_FEAT_EXTRACT,
        data: { featExtractId },
    } as const;
}

export const simplifyFeatExtractSuccess = (featExtractRecord: IFeatExtractRecord) => {
    return {
        type: FeatExtractActionTypes.SIMPLIFY_FEAT_EXTRACT_SUCCESS,
        data: { featExtractRecord },
    } as const;
}

export const simplifyFeatExtractFailure = (error: string) => {
    return {
        type: FeatExtractActionTypes.SIMPLIFY_FEAT_EXTRACT_FAILURE,
        data: error
    } as const;
}


export type IFeatExtractAction = ReturnType<
    typeof listFeatExtract |
    typeof listFeatExtractSuccess |
    typeof listFeatExtractFailure |
    typeof fetchFeatExtract |
    typeof fetchFeatExtractSuccess |
    typeof fetchFeatExtractFailure |
    typeof newFeatExtract |
    typeof newFeatExtractSuccess |
    typeof newFeatExtractFailure |
    typeof submitFeatExtract |
    typeof submitFeatExtractSuccess |
    typeof submitFeatExtractFailure |
    typeof runFeatExtract |
    typeof runFeatExtractSuccess |
    typeof runFeatExtractFailure |
    typeof simplifyFeatExtract |
    typeof simplifyFeatExtractSuccess |
    typeof simplifyFeatExtractFailure
>;

export const reducerFeatExtract = (state = DEFAULT_STATE, action: IFeatExtractAction) : IFeatExtractState => {
    switch (action.type) {
        case FeatExtractActionTypes.LIST_FEAT_EXTRACT_SUCCESS:
            return {
                ...state,
                featExtractIdList: action.data.featExtractIdList,
            }
        case FeatExtractActionTypes.FETCH_FEAT_EXTRACT_SUCCESS:
        case FeatExtractActionTypes.NEW_FEAT_EXTRACT_SUCCESS:
            return {
                ...state,
                featExtractRecord: action.data.featExtractRecord
            }
        case FeatExtractActionTypes.SUBMIT_FEAT_EXTRACT_SUCCESS:
            return {
                ...state,
                featExtractRecord: {
                    ...state.featExtractRecord,
                    featExtractInput: action.data.featExtractInput,
                }
            }
        case FeatExtractActionTypes.RUN_FEAT_EXTRACT_SUCCESS:
            return {
                ...state,
                featExtractRecord: action.data.featExtractRecord,
            }
        case FeatExtractActionTypes.SIMPLIFY_FEAT_EXTRACT_SUCCESS:
            return {
                ...state,
                featExtractRecord: action.data.featExtractRecord,
            }
        default:
            return state;
    }
};

interface IState {
    featExtract: IFeatExtractState;
}

export const getFeatExtractIdList = (state: IState) => state.featExtract.featExtractIdList || undefined

export const getFeatExtractRecord = (state: IState) => state.featExtract.featExtractRecord
