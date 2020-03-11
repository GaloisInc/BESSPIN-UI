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
        triggerReport: jest.fn(),
        reports: [{
          id: 1,
          label: 'test report',
          createdAt: '1234-56-78 00:00:00',
          log: 'test log',
          status: JobStatus.Succeeded,
        }],
        isLoading: false,
        errors: [],
        workflowLabel: '',
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

  describe('when report is currently running', () => {
    
    it('should render re-run item as disabled', () => {
      const wrapper = genReportWrapper({ reports: [{
        id: 99,
        label: 'RUNNING REPORT',
        createdAt: 'DATE STRING',
        status: JobStatus.Running,
      }]});

      const rerunLink = wrapper.findWhere(l => l.key() === 'run-99');
      expect(rerunLink).toHaveLength(1);
      expect(rerunLink.prop('disabled')).toEqual(true);
    });
  });

  describe('when report has succeeded', () => {
    
    it('should render a button to re-run', () => {
      const wrapper = genReportWrapper({ reports: [{
        id: 77,
        label: 'RUNNING REPORT',
        createdAt: 'DATE STRING',
        status: JobStatus.Succeeded,
      }]});

      const rerunLink = wrapper.findWhere(l => l.key() === 'run-77');
      expect(rerunLink).toHaveLength(1);
      expect(rerunLink.prop('disabled')).toEqual(false);
    });
  });

  describe('when report has failed', () => {
    
    it('should render a button to re-run', () => {
      const wrapper = genReportWrapper({ reports: [{
        id: 88,
        label: 'FAILED REPORT',
        createdAt: 'DATE STRING',
        status: JobStatus.Failed,
      }]});

      const rerunLink = wrapper.findWhere(l => l.key() === 'run-88');
      expect(rerunLink).toHaveLength(1);
      expect(rerunLink.prop('disabled')).toEqual(false);
    });
  });
});
