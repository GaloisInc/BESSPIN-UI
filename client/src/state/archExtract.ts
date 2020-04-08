

export interface IArchExtractOutputRecord {
    archExtractOutputId: number,
    archExtractOutputFilename: string,
    archExtractOutputContent?: string,
    archExtractOutputContentConverted?: string,
}

export interface IArchExtractRecord {
    archExtractId: number;
    archExtractInput: string;
    archExtractOutputList?: IArchExtractOutputRecord[];
}

export interface IArchExtractListElem {
    archExtractId: number,
    label: string,
};

export interface IArchExtractState {
    archExtractIdList?: IArchExtractListElem[];
    archExtractRecord: IArchExtractRecord;
    archExtractOutputRecord?: IArchExtractOutputRecord;
}

export const DEFAULT_STATE: IArchExtractState = {
    archExtractRecord: {
        archExtractId: -42,
        archExtractInput: "",
        archExtractOutputList: [],
    }
}


export enum ArchExtractActionTypes {
    LIST_ARCH_EXTRACT = 'arch-extract/list',
    LIST_ARCH_EXTRACT_SUCCESS = 'arch-extract/list/success',
    LIST_ARCH_EXTRACT_FAILURE = 'arch-extract/list/failure',
    FETCH_ARCH_EXTRACT = 'arch-extract/fetch',
    FETCH_ARCH_EXTRACT_SUCCESS = 'arch-extract/fetch/success',
    FETCH_ARCH_EXTRACT_FAILURE = 'arch-extract/fetch/failure',
    NEW_ARCH_EXTRACT = 'arch-extract/new',
    NEW_ARCH_EXTRACT_SUCCESS = 'arch-extract/new/success',
    NEW_ARCH_EXTRACT_FAILURE = 'arch-extract/new/failure',
    SUBMIT_ARCH_EXTRACT = 'arch-extract/submit',
    SUBMIT_ARCH_EXTRACT_SUCCESS = 'arch-extract/submit/success',
    SUBMIT_ARCH_EXTRACT_FAILURE = 'arch-extract/submit/failure',
    RUN_ARCH_EXTRACT = 'arch-extract/run',
    RUN_ARCH_EXTRACT_SUCCESS = 'arch-extract/run/success',
    RUN_ARCH_EXTRACT_FAILURE = 'arch-extract/run/failure',
    CONVERT_ARCH_EXTRACT = 'arch-extract/convert',
    CONVERT_ARCH_EXTRACT_SUCCESS = 'arch-extract/convert/success',
    CONVERT_ARCH_EXTRACT_FAILURE = 'arch-extract/convert/failure',
}

export const listArchExtract = () => {
    return {
        type: ArchExtractActionTypes.LIST_ARCH_EXTRACT,
        data: {}
    } as const;
}

export const listArchExtractSuccess = (archExtractIdList: IArchExtractListElem[]) => {
    return {
        type: ArchExtractActionTypes.LIST_ARCH_EXTRACT_SUCCESS,
        data: { archExtractIdList }
    } as const;
}

export const listArchExtractFailure = (error: string) => {
    return {
        type: ArchExtractActionTypes.LIST_ARCH_EXTRACT_FAILURE,
        data: error
    } as const;
}

export const fetchArchExtract = (archExtractId: number) => {
    return {
        type: ArchExtractActionTypes.FETCH_ARCH_EXTRACT,
        data: { archExtractId }
    } as const;
}

export const fetchArchExtractSuccess = (archExtractRecord: IArchExtractRecord) => {
    return {
        type: ArchExtractActionTypes.FETCH_ARCH_EXTRACT_SUCCESS,
        data: { archExtractRecord }
    } as const;
}

export const fetchArchExtractFailure = (error: string) => {
    return {
        type: ArchExtractActionTypes.FETCH_ARCH_EXTRACT_FAILURE,
        data: error
    } as const;
}


export const newArchExtract = (cpuTemplate: string, label: string) => {
    return {
        type: ArchExtractActionTypes.NEW_ARCH_EXTRACT,
        data: { cpuTemplate, label }
    } as const;
}

export const newArchExtractSuccess = (archExtractRecord: IArchExtractRecord) => {
    return {
        type: ArchExtractActionTypes.NEW_ARCH_EXTRACT_SUCCESS,
        data: { archExtractRecord }
    } as const;
}

export const newArchExtractFailure = (error: string) => {
    return {
        type: ArchExtractActionTypes.NEW_ARCH_EXTRACT_FAILURE,
        data: error
    } as const;
}

export const submitArchExtract = (archExtractId: number, archExtractInput: string) => {
    return {
        type: ArchExtractActionTypes.SUBMIT_ARCH_EXTRACT,
        data: {
            archExtractId,
            archExtractInput,
        }
    } as const;
}

export const submitArchExtractSuccess = (archExtractInput: string) => {
    return {
        type: ArchExtractActionTypes.SUBMIT_ARCH_EXTRACT_SUCCESS,
        data: { archExtractInput }
    } as const;
}

export const submitArchExtractFailure = (error: string) => {
    return {
        type: ArchExtractActionTypes.SUBMIT_ARCH_EXTRACT_FAILURE,
        data: error
    } as const;
}

export const runArchExtract = (archExtractId: number) => {
    return {
        type: ArchExtractActionTypes.RUN_ARCH_EXTRACT,
        data: { archExtractId },
    } as const;
}

export const runArchExtractSuccess = (archExtractOutputList: IArchExtractOutputRecord[]) => {
    return {
        type: ArchExtractActionTypes.RUN_ARCH_EXTRACT_SUCCESS,
        data: { archExtractOutputList }
    } as const;
}

export const runArchExtractFailure = (error: string) => {
    return {
        type: ArchExtractActionTypes.RUN_ARCH_EXTRACT_FAILURE,
        data: error
    } as const;
}

export const convertArchExtract = (archExtractOutputId: number) => {
    return {
        type: ArchExtractActionTypes.CONVERT_ARCH_EXTRACT,
        data: { archExtractOutputId },
    } as const;
}

export const convertArchExtractSuccess = (archExtractOutputRecord: IArchExtractOutputRecord) => {
    return {
        type: ArchExtractActionTypes.CONVERT_ARCH_EXTRACT_SUCCESS,
        data: { archExtractOutputRecord },
    } as const;
}

export const convertArchExtractFailure = (error: string) => {
    return {
        type: ArchExtractActionTypes.CONVERT_ARCH_EXTRACT_FAILURE,
        data: error
    } as const;
}


export type IArchExtractAction = ReturnType<
    typeof listArchExtract |
    typeof listArchExtractSuccess |
    typeof listArchExtractFailure |
    typeof fetchArchExtract |
    typeof fetchArchExtractSuccess |
    typeof fetchArchExtractFailure |
    typeof newArchExtract |
    typeof newArchExtractSuccess |
    typeof newArchExtractFailure |
    typeof submitArchExtract |
    typeof submitArchExtractSuccess |
    typeof submitArchExtractFailure |
    typeof runArchExtract |
    typeof runArchExtractSuccess |
    typeof runArchExtractFailure |
    typeof convertArchExtract |
    typeof convertArchExtractSuccess |
    typeof convertArchExtractFailure
>;

export const reducerArchExtract = (state = DEFAULT_STATE, action: IArchExtractAction) : IArchExtractState => {
    switch (action.type) {
        case ArchExtractActionTypes.LIST_ARCH_EXTRACT_SUCCESS:
            return {
                ...state,
                archExtractIdList: action.data.archExtractIdList,
            }
        case ArchExtractActionTypes.FETCH_ARCH_EXTRACT_SUCCESS:
        case ArchExtractActionTypes.NEW_ARCH_EXTRACT_SUCCESS:
            return {
                ...state,
                archExtractRecord: action.data.archExtractRecord
            }
        case ArchExtractActionTypes.SUBMIT_ARCH_EXTRACT_SUCCESS:
            return {
                ...state,
                archExtractRecord: {
                    ...state.archExtractRecord,
                    archExtractInput: action.data.archExtractInput,
                }
            }
        case ArchExtractActionTypes.RUN_ARCH_EXTRACT_SUCCESS:
            return {
                ...state,
                archExtractRecord: {
                    ...state.archExtractRecord,
                    archExtractOutputList: action.data.archExtractOutputList,
                }
            }
        case ArchExtractActionTypes.CONVERT_ARCH_EXTRACT_SUCCESS:
            return {
                ...state,
                archExtractOutputRecord: action.data.archExtractOutputRecord,
            }
        default:
            return state;
    }
};

interface IState {
    archExtract: IArchExtractState;
}

export const getArchExtractIdList = (state: IState) => state.archExtract.archExtractIdList || undefined

export const getArchExtractRecord = (state: IState) => state.archExtract.archExtractRecord

export const getArchExtractOutputRecord = (state: IState) => state.archExtract.archExtractOutputRecord || undefined
