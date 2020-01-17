import {
    fetchWorkflowsSuccess,
    IWorkflowState,
    reducer,
    submitWorkflowSuccess,
} from './workflow';


const DEFAULT_STATE: IWorkflowState = {
    byId: {},
    ids: [],
};

const generateTestState = (overrides = {}) => {
    return {
        ...DEFAULT_STATE,
        ...overrides,
    };
};

describe('workflow', () => {

    describe('reducer', () => {
        let testState: IWorkflowState;

        describe('when we have successfully fetched workflows', () => {

            describe('and there are no workflows in current state', () => {

                beforeEach(() => {
                    testState = generateTestState();
                });

                it('should add the workflows to "byId"', () => {
                    const testWorkflowState: IWorkflowState = {
                        byId: {
                            1: { id: 1, label: 'WF ONE', createdAt: 'SOME DATE STRING 1' },
                            2: { id: 2, label: 'WF TWO', createdAt: 'SOME DATE STRING 2' },
                        },
                        ids: [1, 2],
                    };
                    
                    const action = fetchWorkflowsSuccess(Object.values(testWorkflowState.byId));

                    expect(reducer(testState, action)).toEqual(testWorkflowState);
                });
            });

            describe('and there are already workflows in current state', () => {

                beforeEach(() => {
                    testState = generateTestState({
                        byId: {
                            1: { id: 1, label: 'WF ONE', createdAt: 'SOME DATE STRING 1' },
                            2: { id: 2, label: 'WF TWO', createdAt: 'SOME DATE STRING 2' },
                        },
                        ids: [1, 2],
                    });
                });

                it('should add the workflows, updating an existing one', () => {
                    const testWorkflowState: IWorkflowState = {
                        byId: {
                            1: { id: 1, label: 'WF ONE', createdAt: 'SOME DATE STRING 1' },
                            2: { id: 2, label: 'WF TWO', createdAt: 'SOME NEW DATE STRING 2' },
                            3: { id: 3, label: 'WF THREE', createdAt: 'SOME DATE STRING 3' },
                        },
                        ids: [1, 2, 3],
                    };
                    
                    const action = fetchWorkflowsSuccess(Object.values(testWorkflowState.byId));

                    expect(reducer(testState, action)).toEqual(testWorkflowState);
                });
            });
        });

        describe('when we have successfully submitted a new workflow', () => {

            describe('and there are no workflows in current state', () => {

                beforeEach(() => {
                    testState = generateTestState();
                });

                it('should add the workflow to "byId"', () => {
                    const testWorkflowState: IWorkflowState = {
                        byId: {
                            1: { id: 1, label: 'WF ONE', createdAt: 'SOME DATE STRING 1' },
                        },
                        ids: [1],
                    };
                    
                    const action = submitWorkflowSuccess(testWorkflowState.byId[1]);

                    expect(reducer(testState, action)).toEqual(testWorkflowState);
                });
            });

            describe('and there are already workflows in current state', () => {

                beforeEach(() => {
                    testState = generateTestState({
                        byId: {
                            1: { id: 1, label: 'WF ONE', createdAt: 'SOME DATE STRING 1' },
                            2: { id: 2, label: 'WF TWO', createdAt: 'SOME DATE STRING 2' },
                        },
                        ids: [1, 2],
                    });
                });

                it('should add the workflows, updating an existing one', () => {
                    const testWorkflowState: IWorkflowState = {
                        byId: {
                            1: { id: 1, label: 'WF ONE', createdAt: 'SOME DATE STRING 1' },
                            2: { id: 2, label: 'WF TWO', createdAt: 'SOME DATE STRING 2' },
                            3: { id: 3, label: 'WF THREE', createdAt: 'SOME DATE STRING 3' },
                        },
                        ids: [1, 2, 3],
                    };
                    
                    const action = submitWorkflowSuccess(testWorkflowState.byId[3]);

                    expect(reducer(testState, action)).toEqual(testWorkflowState);
                });
            });;
        });
    });
});
