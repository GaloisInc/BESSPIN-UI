import React from 'react';
import { shallow } from 'enzyme';
import { MemoryRouter } from 'react-router';

import { Overview } from './Overview';

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
    const systems = [
      {
        hash: 'TEST-HASH-1',
        createdAt: Date.now().toLocaleString(),
        lastUpdate: Date.now().toLocaleString(),
        filename: 'TEST-FILE.fm.json',
        featureCount: 5,
      },
      {
        hash: 'TEST-HASH-2',
        createdAt: Date.now().toLocaleString(),
        lastUpdate: Date.now().toLocaleString(),
        filename: 'TEST-FILE2.fm.json',
        featureCount: 4,
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
