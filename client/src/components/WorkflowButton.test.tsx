import React from 'react';
import { mount } from 'enzyme';
import {
    Button,
    OverlayTrigger,
    Spinner,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IConfig, IReportConfig, JobStatus } from '../state/workflow';
import {
    CreateEditButton,
    ReportButton,
    SystemConfigButton,
    VulnConfigButton,
    WorkflowButton,
} from './WorkflowButton';

describe('WorkflowButton', () => {
    const testLabel = 'test button label';
    const testUrl = '/test/url';

    describe('basic use case', () => {

        it('should render a simple button component', () => {
            const wrapper = mount(<WorkflowButton url={testUrl} label={testLabel} />)
            const button = wrapper.find(Button);

            expect(button).toHaveLength(1);
            expect(button.text()).toEqual(testLabel);

            const props = button.props();

            expect(props.variant).toEqual('primary');
            expect(props.href).toEqual(testUrl);
        });
    });

    describe('tooltip use case', () => {

        it('should render an overlay when given a tooltip error', () => {
            const tooltipError = 'test error message';
            const wrapper = mount(<WorkflowButton url={testUrl} label={testLabel} tooltipError={tooltipError} />);
            const button = wrapper.find(Button);

            expect(button).toHaveLength(1);
            expect(wrapper.find(OverlayTrigger)).toHaveLength(1);

            const props = button.props();

            expect(props.variant).toEqual('danger');
        });
    });

    describe('in-progress use case', () => {

        it('should render a spinner when passed a postive "inProgress" flag', () => {
            const wrapper = mount(<WorkflowButton url={testUrl} label={testLabel} inProgress={true} />);
            const button = wrapper.find(Button);

            expect(button).toHaveLength(1);
            expect(button.find(Spinner)).toHaveLength(1);
        });
    });

    describe('disabled use case', () => {

        it('should render in disabled state when passed a "disabled" prop', () => {
            const wrapper = mount(<WorkflowButton url={testUrl} label={testLabel} disabled={true} />);
            const button = wrapper.find(Button);

            expect(button).toHaveLength(1);

            const props = button.props();

            expect(props.disabled).toEqual(true);
        });
    });

    describe('"next" step use case', () => {

        it('should render a "next" arrow', () => {
            const wrapper = mount(<WorkflowButton url={testUrl} label={testLabel} variant='success' />);
            const button = wrapper.find(Button);

            expect(button).toHaveLength(1);

            expect(wrapper.find(FontAwesomeIcon)).toHaveLength(1);
        });

        it('should NOT render a "next" arrow when disabled', () => {
            const wrapper = mount(<WorkflowButton url={testUrl} label={testLabel} variant='success' disabled={true} />);
            const button = wrapper.find(Button);

            expect(button).toHaveLength(1);

            expect(wrapper.find(FontAwesomeIcon)).toHaveLength(0);
        });

        it('should NOT render a "next" arrow when passed "noNextStep"', () => {
            const wrapper = mount(<WorkflowButton url={testUrl} label={testLabel} variant='success' noNextStep={true} />);
            const button = wrapper.find(Button);

            expect(button).toHaveLength(1);

            expect(wrapper.find(FontAwesomeIcon)).toHaveLength(0);
        });
    });
});

describe('CreateEditButton', () => {
    const testLabel = 'test button label';
    const testPath = '/test/path';
    const testWorkflowId = 1;

    describe('when no config', () => {

        it('should render a basic workflow button', () => {
            const wrapper = mount(<CreateEditButton path={testPath} label={testLabel} workflowId={testWorkflowId} />);
            const button = wrapper.find(WorkflowButton);

            expect(button).toHaveLength(1);
            expect(button.text()).toEqual(testLabel);

            const props = button.props();

            expect(props.url).toEqual(`${testPath}/create/${testWorkflowId}`);
        });
    });

    describe('when given a config', () => {
        const testConfigId = 1;
        const testError = 'TEST ERROR';

        const genConfig = (overrides: Partial<IConfig> = {}): IConfig => {
            return {
                id: testConfigId,
                createdAt: 'SOME DATE STRING',
                ...overrides,
            };
        };

        it('should construct "edit" href', () => {
            const config = genConfig();
            const wrapper = mount(<CreateEditButton config={config} path={testPath} label={testLabel} workflowId={testWorkflowId} />);
            const button = wrapper.find(WorkflowButton);

            expect(button).toHaveLength(1);
            const props = button.props();

            expect(props.url).toEqual(`${testPath}/edit/${testWorkflowId}/${testConfigId}`);
        });

        it('should set tooltipError if config has error message', () => {
            const config = genConfig({ error: { id: 1, message: testError }});
            const wrapper = mount(<CreateEditButton config={config} path={testPath} label={testLabel} workflowId={testWorkflowId} />);
            const button = wrapper.find(WorkflowButton);

            expect(button).toHaveLength(1);
            const props = button.props();

            expect(props.tooltipError).toEqual(testError);
        });
    });
});

describe('SystemConfigButton', () => {
    const testWorkflowId = 1;

    it('should render a CreateEditButton component with the appropriate label and path', () => {
        const wrapper = mount(<SystemConfigButton workflowId={testWorkflowId} config={undefined}/>)
        const button = wrapper.find(CreateEditButton);

        expect(button).toHaveLength(1);
        expect(button.text()).toEqual('System');

        const props = button.props();

        expect(props.path).toEqual('/system-configuration');
    });
});

describe('VulnConfigButton', () => {
    const testWorkflowId = 1;

    it('should render a CreateEditButton component with the appropriate label and path', () => {
        const wrapper = mount(<VulnConfigButton workflowId={testWorkflowId} config={undefined}/>)
        const button = wrapper.find(CreateEditButton);

        expect(button).toHaveLength(1);
        expect(button.text()).toEqual('Vuln');

        const props = button.props();

        expect(props.path).toEqual('/vuln-configuration');
    });
});

describe('ReportButton', () => {
    const testWorkflowId = 1;
    const testConfigId = 1;
    const genConfig = (overrides: Partial<IReportConfig> = {}): IReportConfig => {
        return {
            id: testConfigId,
            createdAt: 'SOME DATE STRING',
            status: JobStatus.Running,
            scores: [],
            ...overrides,
        };
    };

    describe('basic use case', () => {
        it('should render a CreateEditButton component with the appropriate label and path', () => {
            const wrapper = mount(<ReportButton workflowId={testWorkflowId} config={undefined} onClick={jest.fn()} />)
            const button = wrapper.find(WorkflowButton);

            expect(button).toHaveLength(1);
            expect(button.text()).toEqual('Build/Run');

            const props = button.props();

            expect(props.url).toEqual(`/report/${testWorkflowId}`);
        });
    });

    describe('has running job', () => {

        it('should render a CreateEditButton component with the appropriate label and path', () => {
            const wrapper = mount(<ReportButton workflowId={testWorkflowId} config={genConfig()} onClick={jest.fn()} />)
            const button = wrapper.find(WorkflowButton);

            expect(button).toHaveLength(1);
            expect(button.text()).toEqual('Running');

            const props = button.props();

            expect(props.url).toEqual(`/report/${testWorkflowId}`);
        });
    });

    describe('has completed job', () => {

        it('should render a CreateEditButton component with the appropriate label and path', () => {
            const wrapper = mount(<ReportButton workflowId={testWorkflowId} config={genConfig({ status: JobStatus.Succeeded })} onClick={jest.fn()} />)
            const button = wrapper.find(WorkflowButton);

            expect(button).toHaveLength(1);
            expect(button.text()).toEqual('View');

            const props = button.props();

            expect(props.url).toEqual(`/report/${testWorkflowId}`);
        });
    });
});