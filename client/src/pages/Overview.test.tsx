import React from 'react';
import { shallow } from 'enzyme';
import { MemoryRouter } from 'react-router';

import { Overview } from './Overview';
import { ISystemEntry } from '../state/system';

const genDate = (): string => {
    return new Date(Date.now()).toISOString();
};

describe('Overview', () => {

  it('renders without crashing', () => {
    const wrapper = shallow(
      <MemoryRouter initialEntries={['/overview']}>
        <Overview systems={[]}/>
      </MemoryRouter>
    );

    expect(wrapper.find(Overview)).toHaveLength(1);
  });

  it('renders the systems passed in', () => {
    const systems: ISystemEntry[] = [
      {
        uid: 'TEST-HASH-1',
        createdAt: genDate(),
        lastUpdate: genDate(),
        filename: 'TEST-FILE.fm.json',
        featureCount: 5,
        configs: [],
        conftree: {
          constraints: [],
          features: {},
          roots: [],
          version: { base: 1 },
        },
        selectionUndos: [],
      },
      {
        uid: 'TEST-HASH-2',
        createdAt: genDate(),
        lastUpdate: genDate(),
        filename: 'TEST-FILE2.fm.json',
        featureCount: 4,
        configs: [],
        conftree: {
          constraints: [],
          features: {},
          roots: [],
          version: { base: 1 },
        },
        selectionUndos: [],
      },
    ];

    const wrapper = shallow(
      <MemoryRouter initialEntries={['/overview']}>
        <Overview systems={ systems } />
      </MemoryRouter>
    );

    expect(wrapper.find(Overview).shallow().find('.system-row')).toHaveLength(2);
  });
});
