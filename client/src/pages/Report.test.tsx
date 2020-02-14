import React from 'react';
import { mount } from 'enzyme';

import {
  IReportProps,
  Report,
} from './Report';

const genReportWrapper = (propsOverrides: Partial<IReportProps> = {}): ReturnType<typeof mount> => {
    const props: IReportProps = {
        dispatch: jest.fn(),
        isLoading: false,
        errors: [],
        ...propsOverrides,
    };

    return mount(
        <Report {...props} />
    );
};

describe('Report', () => {

  it('renders without crashing', () => {
    const wrapper = genReportWrapper();

    expect(wrapper.html()).toBeTruthy();
  });
});
