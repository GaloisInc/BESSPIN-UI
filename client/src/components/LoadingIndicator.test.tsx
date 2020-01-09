import React from 'react';
import { shallow } from 'enzyme';

import {
    Spinner,
} from 'react-bootstrap';

import { LoadingIndicator } from './LoadingIndicator';

describe('LoadingIndicator', () => {
    let wrapper: ReturnType<typeof shallow>;

    beforeEach(() => {
        wrapper = shallow(<LoadingIndicator />);
    })

    it('should have a spinner', () => {
        expect(wrapper.find(Spinner)).toBeTruthy();
    });
});
