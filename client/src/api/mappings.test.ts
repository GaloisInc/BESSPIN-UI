import {
    mapWorkflow,
    mapWorkflows,
    IServersideWorkflow,
} from './mappings';
import {
    IWorkflow,
} from '../state/workflow';

import { DEFAULT_FEATURE_MODEL } from '../components/graph-helper';

describe('mappings', () => {

    describe('mapWorkflow', () => {

        it.todo('should map minimal serverside workflow into client one');
        it.todo('should map workflow that also has updatedAt information');
        it.todo('should map workflow that also system configuration information');
        it.todo('should map workflow that also test configuration information');
        it.todo('should map workflow that also report information');
        // TODO: are the error messages coming from the API?
    });

    describe('mapWorkflows', () => {

        it('should simply pass thru the given workflow data', () => {
            const TEST_API_WORKFLOWS: IServersideWorkflow[] = [
                { workflowId: 1, label: 'w1', createdAt: 'SOME DATESTRING' },
                { workflowId: 2, label: 'w2', createdAt: 'SOME DATESTRING' },
            ];

            const TEST_CLIENT_WORKFLOWS: IWorkflow[] = [
                { id: 1, label: 'w1', createdAt: 'SOME DATESTRING' },
                { id: 2, label: 'w2', createdAt: 'SOME DATESTRING' },
            ];
            expect(mapWorkflows(TEST_API_WORKFLOWS)).toEqual(TEST_CLIENT_WORKFLOWS);
        })
    });
});
