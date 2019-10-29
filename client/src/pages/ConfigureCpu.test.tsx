import React from 'react';
import { MemoryRouter } from 'react-router';
import { mount } from 'enzyme';

import { ConfigureCpu } from './ConfigureCpu';

describe('ConfigureCpu', () => {

    it('renders without crashing', () => {
        const testSystem = {
            hash: 'TEST-HASH',
            createdAt: Date.now().toLocaleString(),
            lastUpdate: Date.now().toLocaleString(),
            featureCount: 42,
            filename: 'TEST.fm.json',
        };
        const onConfiguratorSubmitSpy = jest.fn();

        const wrapper = mount(
            <MemoryRouter initialEntries={['/configure']}>
                <ConfigureCpu onConfiguratorSubmit={ onConfiguratorSubmitSpy } systemHash={ testSystem.hash } system={ testSystem } />
            </MemoryRouter>
        );

        expect(wrapper.find(ConfigureCpu)).toHaveLength(1);
    });
});
