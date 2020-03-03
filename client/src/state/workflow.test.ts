import {
    fetchWorkflowsSuccess,
    IWorkflowState,
    reducer,
    cloneWorkflowSuccess,
    submitWorkflowSuccess,
    updateWorkflowSuccess,
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
                            1: { id: 1, label: 'WF ONE', createdAt: 'SOME DATE STRING 1', reports: [] },
                            2: { id: 2, label: 'WF TWO', createdAt: 'SOME DATE STRING 2', reports: [] },
                            10: { id: 10, label: 'WF TEN', createdAt: 'SOME DATE STRING 10', reports: [] },
                        },
                        ids: [10, 2, 1],
                    };
                    
                    const action = fetchWorkflowsSuccess(Object.values(testWorkflowState.byId));

                    expect(reducer(testState, action)).toEqual(testWorkflowState);
                });
            });

            describe('and there are already workflows in current state', () => {

                beforeEach(() => {
                    testState = generateTestState({
                        byId: {
                            1: { id: 1, label: 'WF ONE', createdAt: 'SOME DATE STRING 1', reports: [] },
                            2: { id: 2, label: 'WF TWO', createdAt: 'SOME DATE STRING 2', reports: [] },
                        },
                        ids: [2, 1],
                    });
                });

                it('should add the workflows, updating an existing one', () => {
                    const testWorkflowState: IWorkflowState = {
                        byId: {
                            1: { id: 1, label: 'WF ONE', createdAt: 'SOME DATE STRING 1', reports: [] },
                            2: { id: 2, label: 'WF TWO', createdAt: 'SOME NEW DATE STRING 2', reports: [] },
                            3: { id: 3, label: 'WF THREE', createdAt: 'SOME DATE STRING 3', reports: [] },
                        },
                        ids: [3, 2, 1],
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
                            1: { id: 1, label: 'WF ONE', createdAt: 'SOME DATE STRING 1', reports: [] },
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
                            1: { id: 1, label: 'WF ONE', createdAt: 'SOME DATE STRING 1', reports: [] },
                            2: { id: 2, label: 'WF TWO', createdAt: 'SOME DATE STRING 2', reports: [] },
                        },
                        ids: [2, 1],
                    });
                });

                it('should add the workflows, updating an existing one', () => {
                    const testWorkflowState: IWorkflowState = {
                        byId: {
                            1: { id: 1, label: 'WF ONE', createdAt: 'SOME DATE STRING 1', reports: [] },
                            2: { id: 2, label: 'WF TWO', createdAt: 'SOME DATE STRING 2', reports: [] },
                            3: { id: 3, label: 'WF THREE', createdAt: 'SOME DATE STRING 3', reports: [] },
                        },
                        ids: [3, 2, 1],
                    };
                    
                    const action = submitWorkflowSuccess(testWorkflowState.byId[3]);

                    expect(reducer(testState, action)).toEqual(testWorkflowState);
                });
            });
        });

        describe('when we have successfully cloned a workflow', () => {

            beforeEach(() => {
                testState = generateTestState({
                    byId: {
                        1: { id: 1, label: 'WF ONE', createdAt: 'SOME DATE STRING 1', reports: [] },
                    },
                    ids: [1],
                });
            });

            it('should add the workflow', () => {
                const testWorkflowState: IWorkflowState = {
                    byId: {
                        1: { id: 1, label: 'WF ONE', createdAt: 'SOME DATE STRING 1', reports: [] },
                        2: { id: 2, label: 'COPY - WF ONE', createdAt: 'SOME DATE STRING 2', reports: [] },
                    },
                    ids: [2, 1],
                };
                
                const action = cloneWorkflowSuccess(testWorkflowState.byId[2]);

                expect(reducer(testState, action)).toEqual(testWorkflowState);
            });
        });

        describe('when we have successfully updated a workflow', () => {

            beforeEach(() => {
                testState = generateTestState({
                    byId: {
                        1: { id: 1, label: 'WF ONE', createdAt: 'SOME DATE STRING 1', reports: [] },
                    },
                    ids: [1],
                });
            });

            it('should add the workflows, updating an existing one', () => {
                const testWorkflowState: IWorkflowState = {
                    byId: {
                        1: { id: 1, label: 'COPY - WF ONE', createdAt: 'SOME DATE STRING 1', reports: [] },
                    },
                    ids: [1],
                };
                
                const action = updateWorkflowSuccess(testWorkflowState.byId[1]);
                const newState = reducer(testState, action);

                expect(newState).toEqual(testWorkflowState);
            });
        });
    });
});
