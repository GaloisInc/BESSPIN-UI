import {
    IArchExtractState,
    listArchExtractSuccess,
    fetchArchExtractSuccess,
    newArchExtractSuccess,
    submitArchExtractSuccess,
    runArchExtractSuccess,
    convertArchExtractSuccess,
    reducerArchExtract,
    DEFAULT_STATE,
} from './archExtract';



const generateTestState = (overrides = {}) => {
    return {
        ...DEFAULT_STATE,
        ...overrides,
    };
};

describe('archExtract', () => {
    describe('reducer', () => {
        let testState: IArchExtractState;

        describe('when we have successfully fetched the list of archExtract jobs', () => {
            describe('and there are no record in current state', () => {

                beforeEach(() => {
                    testState = generateTestState();
                });

                it('', () => {
                    const resultState: IArchExtractState = {
                        ...DEFAULT_STATE,
                        archExtractIdList: [
                            {
                                archExtractId: 42,
                                label: 'label1',
                            },
                            {
                                archExtractId: 43,
                                label: 'label2'
                            },
                        ],
                    };

                    const action = listArchExtractSuccess(resultState?.archExtractIdList || []);

                    expect(reducerArchExtract(testState, action)).toEqual(resultState);
                });
            });
        });

        describe('when we have successfully fetched an archExtract job', () => {
            describe('and there the record is dummy', () => {

                beforeEach(() => {
                    testState = generateTestState();
                });

                it('', () => {
                    const resultState: IArchExtractState = {
                        ...DEFAULT_STATE,
                        archExtractRecord: {
                            archExtractId: 45,
                            archExtractInput: 'DUMMY_INPUT',
                        },
                    };

                    const action = fetchArchExtractSuccess(resultState.archExtractRecord);

                    expect(reducerArchExtract(testState, action)).toEqual(resultState);
                });
            });
        });

        describe('when we have successfully created a new archExtract job', () => {
            describe('and there the record is dummy', () => {

                beforeEach(() => {
                    testState = generateTestState();
                });

                it('', () => {
                    const resultState: IArchExtractState = {
                        ...DEFAULT_STATE,
                        archExtractRecord: {
                            archExtractId: 45,
                            archExtractInput: 'DUMMY_INPUT',
                        },
                    };

                    const action = newArchExtractSuccess(resultState.archExtractRecord);

                    expect(reducerArchExtract(testState, action)).toEqual(resultState);
                });
            });
        });

        describe('when we have successfully saved a new archExtract job', () => {
            describe('and there the record is dummy', () => {

                beforeEach(() => {
                    testState = generateTestState();
                });

                const preState: IArchExtractState = {
                    ...testState,
                    archExtractRecord: {
                        archExtractId: 45,
                        archExtractInput: 'DUMMY_INPUT',
                    },
                };

                it('', () => {
                    const resultState: IArchExtractState = {
                        ...DEFAULT_STATE,
                        archExtractRecord: {
                            archExtractId: 45,
                            archExtractInput: 'BETTER_INPUT',
                        },
                    };

                    const action = submitArchExtractSuccess(resultState.archExtractRecord.archExtractInput);

                    expect(reducerArchExtract(preState, action)).toEqual(resultState);
                });
            });
        });


        describe('when we have successfully run an archExtract job', () => {
            describe('and there the record is dummy', () => {

                beforeEach(() => {
                    testState = generateTestState();
                });

                const preState: IArchExtractState = {
                    ...testState,
                    archExtractRecord: {
                        archExtractId: 45,
                        archExtractInput: 'DUMMY_INPUT',
                    }
                }
                it('', () => {
                    const resultState: IArchExtractState = {
                        ...DEFAULT_STATE,
                        archExtractRecord: {
                            archExtractId: 45,
                            archExtractInput: 'DUMMY_INPUT',
                            archExtractOutputList: [
                                {
                                    archExtractOutputId: 12,
                                    archExtractOutputFilename: 'filename1',
                                },
                                {
                                    archExtractOutputId: 13,
                                    archExtractOutputFilename: 'filename2',
                                },
                            ],
                        },
                    };

                    const action = runArchExtractSuccess(resultState.archExtractRecord.archExtractOutputList || []);

                    expect(reducerArchExtract(preState, action)).toEqual(resultState);
                });
            });
        });

        describe('when we have successfully converted a dot from an archExtract job', () => {
            describe('and there the record is dummy', () => {

                beforeEach(() => {
                    testState = generateTestState();
                });

                const outputRecord = {
                    archExtractOutputFilename: 'sdfsdf',
                    archExtractOutputId: 16786,
                    archExtractOutputContentConverted: 'ab12313b345',
                };

                it('', () => {
                    const resultState: IArchExtractState = {
                        ...DEFAULT_STATE,
                        archExtractOutputRecord: outputRecord,
                    };

                    const action = convertArchExtractSuccess(outputRecord);

                    expect(reducerArchExtract(testState, action)).toEqual(resultState);
                });
            });
        });
    });
})