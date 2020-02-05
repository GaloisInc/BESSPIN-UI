import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    useParams
  } from "react-router-dom";
import { Dispatch } from 'redux';
import { connect } from 'react-redux'

import {
    Container,
    Table,
    Form,
    Row,
    Col,
    Button,
    Alert,
} from 'react-bootstrap';

import { IState } from '../state';

import { LoadingIndicator } from '../components/LoadingIndicator';

import {
    getError,
    getIsLoading,
} from '../state/ui';

import { Header } from '../components/Header';

import '../style/VulnClassSelector.scss';

interface IStateFromProps {
    errors: string[];
    isLoading: boolean;
    isEditMode: boolean,
}

interface IDispatchFromProps {
    dispatch: Dispatch;
    //createSystemConfig: typeof submitSystemConfigInput;
    //updateSystemConfig: typeof updateSystemConfigInput;
}

export type IVulnClassSelectorProps  = IStateFromProps & IDispatchFromProps;

export const VulnClassSelector: React.FC<IVulnClassSelectorProps> = ( {
        isEditMode,
        isLoading,
        errors,
    }) => {

    const { workflowId, testId } = useParams();
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

    const getVulnChoice = () => {
        const i = checkboxes.reduce(((acc,b) => b? (acc+1) : acc), 0);
        return i;
    };

    return (
        <Container className='VulnClassSelector'>
            { isLoading && <LoadingIndicator /> }
            { errors && errors.length > 0 &&
                <Alert variant='danger'>{ <ul>{errors.map((e, i) => (<li key={`error-${i}`}>{e}</li>))} </ul> }
                </Alert>
            }
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
                        multiple
                    />
                    <Form.Check
                        type='checkbox'
                        label={`PPAC`}
                        id={`ppac`}
                        onChange = { () => doTheCheckbox(1) }
                        multiple = {false}
                    />
                    <Form.Check
                        type='checkbox'
                        label={`Resource Management`}
                        id={`resource-management`}
                        onChange = { () => doTheCheckbox(2) }
                        multiple = {false}
                    />
                    <Form.Check
                        type='checkbox'
                        label={`Information Leakage`}
                        id={`information leakage`}
                        onChange = { () => doTheCheckbox(3) }
                        multiple
                    />
                    <Form.Check
                        type='checkbox'
                        label={`Numeric Errors`}
                        id={`numeric-errors`}
                        onChange = { () => doTheCheckbox(4) }
                        multiple = {false}
                    />
                    </Col>

                    <Form.Group as={Row}>
                        <Col sm={{ span: 10, offset: 2 }}>
                            <Button href= { `/test-configuration/configure-vulnerability/${workflowId}/${getVulnChoice()}/${testId}` } >
                                Configure
                            </Button>
                        </Col>
                    </Form.Group>
                </fieldset></div>
            </Form>
        </Container>
  );
}

interface IOwnProps {
    isEditMode: boolean,
}

const mapStateToProps = (state: IState, ownProps: IOwnProps): IStateFromProps => {
    const error = getError(state);
    const isLoading = getIsLoading(state);

    return {
        errors: [],
        isLoading,
        isEditMode: ownProps.isEditMode,
    };
};

const mapDispatchToProps = (dispatch: Dispatch): IDispatchFromProps => ({
    dispatch,
    //createSystemConfig: (config: INewSystemConfigInput) => dispatch(submitSystemConfigInput(config)),
    //updateSystemConfig: (config: ISystemConfigInput) => dispatch(updateSystemConfigInput(config)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export const ConnectedVulnClassSelector = connector(VulnClassSelector);
