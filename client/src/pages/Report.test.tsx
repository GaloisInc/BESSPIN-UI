import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';

import {
  IReportProps,
  Report,
} from './Report';
import { JobStatus } from '../state/workflow';

const genReportWrapper = (propsOverrides: Partial<IReportProps> = {}): ReturnType<typeof mount> => {
    const props: IReportProps = {
        dataRequested: true,
        fetchWorkflow: jest.fn(),
        report: {
          id: 1,
          label: 'test report',
          createdAt: '1234-56-78 00:00:00',
          log: 'test log',
          status: JobStatus.Succeeded,
        },
        isLoading: false,
        errors: [],
        ...propsOverrides,
    };

    return mount(
      <MemoryRouter initialEntries={['/workflow/1']}>
        <Report {...props} />
      </MemoryRouter>
    );
};

describe('Report', () => {

  it('renders without crashing', () => {
    const wrapper = genReportWrapper();

    expect(wrapper.html()).toBeTruthy();
  });
});
