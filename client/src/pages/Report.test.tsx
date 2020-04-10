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
          scores: [],
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
  let wrapper: ReturnType<typeof genReportWrapper>;

  it('renders without crashing', () => {
    wrapper = genReportWrapper();

    expect(wrapper.html()).toBeTruthy();
  });

  describe('when report is currently running', () => {

    beforeEach(() => {
      wrapper = genReportWrapper({ reports: [{
        id: 99,
        label: 'RUNNING REPORT',
        createdAt: 'DATE STRING',
        status: JobStatus.Running,
        scores: [],
      }]});
    });
    
    it('should render re-run item as disabled', () => {
      const rerunLink = wrapper.findWhere(l => l.key() === 'run-99');
      expect(rerunLink).toHaveLength(1);
      expect(rerunLink.prop('disabled')).toEqual(true);
    });

    it('should render a "no score" block', () => {
      const noScoreBlock = wrapper.find('div.no-scores');
      expect(noScoreBlock).toHaveLength(1);
      expect(noScoreBlock.getDOMNode()).toBeVisible();
    });

    it('should not render scores table', () => {
      const scoresTable = wrapper.find('table.scores');
      expect(scoresTable).toHaveLength(0);
    });
  });

  describe('when report has succeeded', () => {
    
    it('should render a button to re-run', () => {
      wrapper = genReportWrapper({ reports: [{
        id: 77,
        label: 'RUNNING REPORT',
        createdAt: 'DATE STRING',
        status: JobStatus.Succeeded,
        scores: [{ id: 1, cwe: 123, score: 'V_HIGH', notes: '' }],
      }]});

      const rerunLink = wrapper.findWhere(l => l.key() === 'run-77');
      expect(rerunLink).toHaveLength(1);
      expect(rerunLink.prop('disabled')).toEqual(false);
    });

    it('should not render a "no score" block', () => {
      const noScoreBlock = wrapper.find('div.no-scores');
      expect(noScoreBlock).toHaveLength(0);
    });

    it('should render scores table', () => {
      const scoresTable = wrapper.find('table.scores');
      expect(scoresTable).toHaveLength(1)
    });
  });

  describe('when report has failed', () => {
    
    it('should render a button to re-run', () => {
      wrapper = genReportWrapper({ reports: [{
        id: 88,
        label: 'FAILED REPORT',
        createdAt: 'DATE STRING',
        status: JobStatus.Failed,
        scores: [],
      }]});

      const rerunLink = wrapper.findWhere(l => l.key() === 'run-88');
      expect(rerunLink).toHaveLength(1);
      expect(rerunLink.prop('disabled')).toEqual(false);
    });
  });
});
