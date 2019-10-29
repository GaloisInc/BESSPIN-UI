import React from 'react';
import { MemoryRouter } from 'react-router';
import { mount } from 'enzyme';

import { Header } from './Header';

describe('Header', () => {

    it('renders without crashing', () => {
        const wrapper = mount(
            <MemoryRouter initialEntries={['/configure']}>
                <Header />
            </MemoryRouter>
        );

        expect(wrapper.find(Header)).toHaveLength(1);
    });
});
