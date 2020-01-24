import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux'

import {
    Container,
    Table,
    Form,
    Row,
    Col,
    Button,
} from 'react-bootstrap';

import { IState } from '../state';

import {
    ITestEntry,
    getEntries
} from '../state/test-results';

import { Header } from '../components/Header';

import '../style/VulnClassSelector.scss';

export interface IVulnClassSelectorProps {
    entries: ITestEntry[];
}

export const VulnClassSelector: React.FC<IVulnClassSelectorProps> = (props) => {
    const [checkboxes, setCheckboxes] = useState([false, false, false, false]);

    /* TODO this def is current unused but the goal is to create the checkboxes
       programmatically and have some logic to handle exclusive checks if that's
       what makes sense in the workflow. Currently it just pick the last checked
       checkbox and href to it with the Configure button */
    const vulnerabilityClasses = [
        "Buffer Errors",
        "PPAC",
        "Resource Management",
        "Information Leakage",
        "Nemeric Errors",
    ];

    const doTheCheckbox = (i: number) => {
        const newArray : Array<boolean> = [...checkboxes];
        newArray[i] = !newArray[i];
        setCheckboxes(newArray);
    };

    const getChoice = () => {
        const i = checkboxes.reduce(((acc,b) => b? (acc+1) : acc), 0);
        return i;
    };

    return (
        <Container className='VulnClassSelector'>
            <Header />
            <h1>Vulnerability Class Selector</h1>
            <Form>
                <div>
                    Select Vulnerability Class:
                    <fieldset>
                    <Col sm={10}>
                    <Form.Check
                        type='checkbox'
                        label={`Buffer Errors`}
                        id={`buffer-errors`}
                        onChange = { () => doTheCheckbox(0) }
                    />
                    <Form.Check
                        type='checkbox'
                        label={`PPAC`}
                        id={`ppac`}
                        onChange = { () => doTheCheckbox(1) }
                    />
                    <Form.Check
                        type='checkbox'
                        label={`Resource Management`}
                        id={`resource-management`}
                        onChange = { () => doTheCheckbox(2) }
                    />
                    <Form.Check
                        type='checkbox'
                        label={`Information Leakage`}
                        id={`information leakage`}
                        onChange = { () => doTheCheckbox(3) }
                    />
                    <Form.Check
                        type='checkbox'
                        label={`Numeric Errors`}
                        id={`numeric-errors`}
                        onChange = { () => doTheCheckbox(4) }
                    />
                    </Col>

                    <Form.Group as={Row}>
                        <Col sm={{ span: 10, offset: 2 }}>
                            <Button href= { "/api/configure-test/" + getChoice() } >
                                Configure
                            </Button>
                        </Col>
                    </Form.Group>
                </fieldset></div>
            </Form>
        </Container>
  );
}

const mapStateToProps = (state: IState): IVulnClassSelectorProps => {
    return {
        entries: getEntries(state),
    };
};

export const ConnectedVulnClassSelector = connect(mapStateToProps)(VulnClassSelector);
