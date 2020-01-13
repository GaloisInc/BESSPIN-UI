import React from 'react';
import { mount } from 'enzyme';

import {
    Overview,
    IOverviewProps,
    IWorkflow,
} from './Overview';
import {
    SystemActionTypes,
} from '../state/system';
import { LoadingIndicator } from '../components/LoadingIndicator';


const genDate = (): string => {
    return (new Date(Date.now())).toISOString();
};

const genOverviewWrapper = (propsOverrides: Partial<IOverviewProps> = {}): ReturnType<typeof mount> => {
    const props: IOverviewProps = {
        workflows: [],
        createNewWorkflow: jest.fn(),
        isLoading: false,
        dataRequested: true,
        ...propsOverrides,
    };

    return mount(
        <Overview {...props} />
    );
};

describe('Overview', () => {

  it('renders without crashing', () => {
    const wrapper = genOverviewWrapper();

    expect(wrapper.html()).toBeTruthy();
  });

  it('renders the workflows passed in', () => {
    const workflows: IWorkflow[] = [
        {
          id: 1,
          label: 'TEST WORKFLOW ONE',
          createdAt: genDate(),
      },
      {
          id: 2,
          label: 'TEST WORKFLOW TWO',
          createdAt: genDate(),
      },
    ];

    const wrapper = genOverviewWrapper({ workflows });

    expect(wrapper.find('.workflow-row')).toHaveLength(2);
  });

  it('renders button to create new workflow', () => {
    const wrapper = genOverviewWrapper();

    expect(wrapper.find('button.new-workflow').length).toEqual(1);
  });

  it('renders loading indicator if we are loading', () => {
    const wrapper = genOverviewWrapper({ isLoading: true });

    expect(wrapper.find(LoadingIndicator).length).toEqual(1);
  });

  it('dispatches action to fetch data if no data has been fetched', () => {
      const dispatchSpy = jest.fn();
      genOverviewWrapper({ dataRequested: false, dispatch: dispatchSpy });

      expect(dispatchSpy).toHaveBeenCalledWith({ type: SystemActionTypes.FETCH_TEST_SYSTEMS });
  });

  it('does not show "new workflow" modal by default', () => {
    const wrapper = genOverviewWrapper();

    // this is weird, but apparently mount does some rendering of the modal
    // even though the real-world does...
    const editorContent = wrapper.find('.workflow-editor').map(f => f.text()).filter(f => f).length
    expect(editorContent).toBe(0);
  });

  it('does show "new workflow" modal when the "create" button is clicked', () => {
    const wrapper = genOverviewWrapper();

    wrapper.find('button.new-workflow').simulate('click');

    // this is weird, but apparently mount does some rendering of the modal
    // even though the real-world does...
    const editorContent = wrapper.find('.workflow-editor').map(f => f.text()).filter(f => f).length
    expect(editorContent).toBeGreaterThan(0);
  });

  it('calls our "create" handler with content when the create button is clicked', () => {
    const TEST_LABEL = 'TEST-LABEL';
    const createNewWorkflowSpy = jest.fn();
    const wrapper = genOverviewWrapper({
        createNewWorkflow: createNewWorkflowSpy,
    });

    wrapper.find('button.new-workflow').simulate('click');
    wrapper.find('input.new-workflow-label').simulate('blur', { target: { value: TEST_LABEL } });
    wrapper.find('button.create-new-workflow').simulate('click');

    expect(createNewWorkflowSpy).toHaveBeenCalledWith(TEST_LABEL);
  });
});
