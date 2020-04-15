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
            configs: [],
            conftree: {
              constraints: [],
              features: {},
              roots: [],
              version: { base: 1 },
            },
            configuredConftree: {
                constraints: [],
                features: {},
                roots: [],
                version: { base: 1 },
            },
            selectionUndos: [],
        };
        const submitValidateConfigurationSpy = jest.fn();
        const submitSystemSpy = jest.fn();
        const selectFeatureSpy = jest.fn();
        const selectFeatureUndoSpy = jest.fn();
        const selectFeatureRedoSpy = jest.fn();
        const fetchSystemSpy = jest.fn();

        const wrapper = mount(
            <MemoryRouter initialEntries={['/configure']}>
                <ConfigureCpu
                    submitValidateConfiguration={ submitValidateConfigurationSpy }
                    submitSystem={ submitSystemSpy }
                    selectFeature={ selectFeatureSpy }
                    selectFeatureUndo={ selectFeatureUndoSpy }
                    selectFeatureRedo={ selectFeatureRedoSpy }
                    fetchSystem={ fetchSystemSpy }
                    dataRequested={ true }
                    isLoading = { false }
                    errors = { [] }
                    systemUid={ testSystem.uid }
                    system={ testSystem } />
            </MemoryRouter>
        );

        expect(wrapper.find(ConfigureCpu)).toHaveLength(1);
    });
});
