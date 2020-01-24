import React from 'react';
import { mount } from 'enzyme';
import { Dispatch } from 'redux';

import {
  ISystemConfigInputProps,
  SystemConfigInput,
} from './SystemConfigInput';
import {
  submitSystemConfigInput,
  updateSystemConfigInput,
} from '../state/system';

const genSystemConfigInputWrapper = () => {
    const props: ISystemConfigInputProps = {
      isLoading: false,
      errors: [],
      dispatch: jest.fn() as Dispatch,
      workflowId: -1,
      createSystemConfig: jest.fn() as typeof submitSystemConfigInput,
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
