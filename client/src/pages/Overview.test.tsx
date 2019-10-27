import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router';

import { Overview } from './Overview';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter initialEntries={['/overview']}>
      <Overview systems={[]}/>
    </MemoryRouter>, div);
  ReactDOM.unmountComponentAtNode(div);
});
