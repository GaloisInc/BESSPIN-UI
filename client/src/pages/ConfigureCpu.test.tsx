import React from 'react';
import { MemoryRouter } from 'react-router';
import { mount } from 'enzyme';

import { ConfigureCpu } from './ConfigureCpu';

const genDate = (): string => {
    return new Date(Date.now()).toISOString();
};

describe('ConfigureCpu', () => {

    it('renders without crashing', () => {
        const testSystem = {
            uid: 'TEST-HASH',
            createdAt: genDate(),
            lastUpdate: genDate(),
            featureCount: 42,
            filename: 'TEST.fm.json',
        };
        const onConfiguratorSubmitSpy = jest.fn();
        const fetchSystemSpy = jest.fn();

        const wrapper = mount(
            <MemoryRouter initialEntries={['/configure']}>
                <ConfigureCpu
                    onConfiguratorSubmit={ onConfiguratorSubmitSpy }
                    fetchSystem={ fetchSystemSpy }
                    dataRequested={ true }
                    systemUid={ testSystem.uid }
                    system={ testSystem } />
            </MemoryRouter>
        );

        expect(wrapper.find(ConfigureCpu)).toHaveLength(1);
    });
});
