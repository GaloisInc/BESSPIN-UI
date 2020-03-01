import React from 'react';
import { mount } from 'enzyme';

import {
  ISystemConfigInputProps,
  SystemConfigInput,
} from './SystemConfigInput';
import {
  submitSystemConfigInput,
  updateSystemConfigInput,
  fetchSystemConfigInput,
} from '../state/feature-model';

const genSystemConfigInputWrapper = () => {
    const props: ISystemConfigInputProps = {
      isLoading: false,
      errors: [],
      workflowId: -1,
      createSystemConfig: jest.fn() as typeof submitSystemConfigInput,
      fetchSystemConfigInput: jest.fn() as typeof fetchSystemConfigInput,
      updateSystemConfig: jest.fn() as typeof updateSystemConfigInput,
    };

    return mount(<SystemConfigInput {...props} />);
};

describe('SystemConfigInput', () => {

  it('renders without crashing', () => {
    const wrapper = genSystemConfigInputWrapper();

    expect(wrapper.html()).toBeTruthy();
  });
});
