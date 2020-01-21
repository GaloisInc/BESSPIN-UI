import React from 'react';
import { mount } from 'enzyme';

import {
  ISystemConfigInputProps,
  SystemConfigInput,
} from './SystemConfigInput';
import { submitSystemConfigInput } from '../state/system';

const genSystemConfigInputWrapper = () => {
    const props: ISystemConfigInputProps = {
      workflowId: -1,
      createSystemConfig: jest.fn() as typeof submitSystemConfigInput,
    };

    return mount(<SystemConfigInput {...props} />);
};

describe('SystemConfigInput', () => {

  it('renders without crashing', () => {
    const wrapper = genSystemConfigInputWrapper();

    expect(wrapper.html()).toBeTruthy();
  });
});
