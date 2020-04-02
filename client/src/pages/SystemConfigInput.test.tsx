import React from 'react';
import { mount } from 'enzyme';

import AceEditor from 'react-ace';

import {
  ISystemConfigInputProps,
  SystemConfigInput,
} from './SystemConfigInput';
import {
  submitSystemConfigInput,
  updateSystemConfigInput,
  fetchSystemConfigInput,
  ISystemConfigInput,
} from '../state/feature-model';

const genSystemConfigInputWrapper = (propsOverrides: Partial<ISystemConfigInputProps> = {}) => {
    const defaultProps: ISystemConfigInputProps = {
      isLoading: false,
      errors: [],
      workflowId: -1,
      createSystemConfig: jest.fn() as typeof submitSystemConfigInput,
      fetchSystemConfigInput: jest.fn() as typeof fetchSystemConfigInput,
      updateSystemConfig: jest.fn() as typeof updateSystemConfigInput,
    };

    const props: ISystemConfigInputProps = {
      ...defaultProps,
      ...propsOverrides,
    };

    return mount(<SystemConfigInput {...props} />);
};

describe('SystemConfigInput', () => {
  let wrapper: ReturnType<typeof genSystemConfigInputWrapper>;

  it('renders without crashing', () => {
    wrapper = genSystemConfigInputWrapper();

    expect(wrapper.html()).toBeTruthy();
  });

  describe('editor', () => {
    const TEST_NIX_CONFIG_TEXT = 'TEST NIX CONFIG';
    const TEST_CREATED_AT = (new Date()).toISOString();
    const TEST_ID = 1;
    const TEST_LABEL = 'TEST LABEL';
    const TEST_FILENAME = 'TEST.nix';
    const TEST_WORKFLOW_ID = 666;

    const TEST_SYSCONFIG: ISystemConfigInput = {
      id: TEST_ID,
      createdAt: TEST_CREATED_AT,
      label: TEST_LABEL,
      workflowId: TEST_WORKFLOW_ID,
      nixConfigFilename: TEST_FILENAME,
      nixConfig: TEST_NIX_CONFIG_TEXT,
    };
    
    it('should render nix config passed in', () => {
      wrapper = genSystemConfigInputWrapper({
        sysConfigId: 1,
        sysConfig: TEST_SYSCONFIG,
        workflowId: TEST_WORKFLOW_ID,
      });

      const configViewer = wrapper.find('.config-viewer');
      expect(configViewer).toHaveLength(1);
      const editorInstance = wrapper.find(AceEditor).instance();
      expect((editorInstance.props as any).value).toEqual(TEST_NIX_CONFIG_TEXT);
    });

    it('should save the value we set', () => {
      const updateSpy = jest.fn();
      wrapper = genSystemConfigInputWrapper({
        updateSystemConfig: updateSpy,
        sysConfigId: 1,
        sysConfig: TEST_SYSCONFIG,
        workflowId: TEST_WORKFLOW_ID,
      });

      // NOTE: you have to use hostNodes() here because there is the React "Button"
      //       that has the .submit-config class and the underlying DOM node
      //       this will limit the selection to the DOM node which we want to actually
      //       interact with
      wrapper.find('.submit-config').hostNodes().simulate('click');
      expect(updateSpy).toHaveBeenCalledWith({
        createdAt: TEST_CREATED_AT,
        id: TEST_ID,
        label: TEST_LABEL,
        nixConfig: TEST_NIX_CONFIG_TEXT,
        nixConfigFilename: TEST_FILENAME,
        workflowId: TEST_WORKFLOW_ID,
      });
    });
  });
});
