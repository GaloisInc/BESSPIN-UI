import React from 'react';
import { mount } from 'enzyme';

import {
  Report,
} from './Report';

const genReportWrapper = (/* propsOverrides: Partial<IReportProps> = {} */): ReturnType<typeof mount> => {
    // const props: IReportProps = {
    //     dispatch: jest.fn(),
    //     isLoading: false,
    //     dataRequested: true,
    //     ...propsOverrides,
    // };

    return mount(
        <Report />
    );
};

describe('Report', () => {

  it('renders without crashing', () => {
    const wrapper = genReportWrapper();

    expect(wrapper.html()).toBeTruthy();
  });
});
