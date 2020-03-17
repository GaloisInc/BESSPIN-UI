import React, { useEffect, useState } from 'react';
import {
    useParams
} from "react-router-dom";
import { connect } from 'react-redux';

import {
    Alert,
    Button,
    ButtonGroup,
    Container,
} from 'react-bootstrap';

import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-json';
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/snippets/python";

import '../style/TestgenConfigInput.scss';

import { Header } from '../components/Header';
import { LoadingIndicator } from '../components/LoadingIndicator';

import {
    getError,
    getIsLoading,
} from '../state/ui';

import {
    createTestgenConfigInput,
    submitTestgenConfigInput,
    fetchTestgenConfigInput,
    getTestgenConfigInput,
    getTestgenConfigInputId
} from '../state/testgenConfigInput';

import { IState } from '../state';

interface IStateFromProps {
    errors: string[];
    isLoading: boolean;
    initConfigInput?: string;
    dynamicTestgenConfigId?: number;
}

interface IDispatchFromProps {
    createTestgenConfigInput: typeof createTestgenConfigInput;
    submitTestgenConfigInput: typeof submitTestgenConfigInput;
    fetchTestgenConfigInput: typeof fetchTestgenConfigInput;
}

export type IProps  = IStateFromProps & IDispatchFromProps;

export const TestgenConfigInput: React.FC<IProps> = ({
    errors,
    isLoading,
    initConfigInput,
    dynamicTestgenConfigId,
    fetchTestgenConfigInput,
    createTestgenConfigInput,
    submitTestgenConfigInput,
}) => {

    const { workflowId, testgenConfigId } = useParams();
    const [editorText, setEditorText] = useState('');

    useEffect(() => {
        if (workflowId && testgenConfigId) {
            if (testgenConfigId) {
                fetchTestgenConfigInput(workflowId, Number(testgenConfigId));
            }
            else {
                createTestgenConfigInput(workflowId);
            }
        }
    }, [testgenConfigId, workflowId, fetchTestgenConfigInput, createTestgenConfigInput]);

    useEffect(() => {
        if (initConfigInput) {
            setEditorText(initConfigInput);
        }
    }, [initConfigInput]);

    return (
        <Container className='TestgenConfigInput'>
            <Header />
            <h1>Testgen configuration</h1>
            <Container className='testgen-config-form'>
                { isLoading && <LoadingIndicator /> }
                { errors && errors.length > 0 && <Alert variant='danger'>{ <ul>{errors.map((e, i) => (<li key={`error-${i}`}>{e}</li>))} </ul> }</Alert> }
                <ButtonGroup>
                    <Button
                        onClick={() => { if (workflowId) {createTestgenConfigInput(workflowId);} }}
                        disabled={(initConfigInput)? true : false}
                    >
                        Create from default
                    </Button>
                    <Button
                        onClick={() => {
                            if (workflowId && dynamicTestgenConfigId) {
                                submitTestgenConfigInput(
                                    workflowId,
                                    dynamicTestgenConfigId,
                                    editorText
                                );
                            }}
                        }
                        variant={ (initConfigInput === editorText) ? 'secondary' : 'primary' }
                        disabled={ (dynamicTestgenConfigId) ? false : true }
                    >
                        Save
                    </Button>
                </ButtonGroup>
            </Container>
            <AceEditor
                mode="python"
                name='editor-configs'
                //setOptions={{ useWorker: false }}
                theme='monokai'
                //value={ configInput? configInput : '' }
                onChange={ (newValue) => setEditorText(newValue) }
                value={ editorText }
                width='100%'
                height='65vh' />
        </Container>
    );
};

const mapStateToProps = (state: IState): IStateFromProps => {
    const initConfigInput = getTestgenConfigInput(state);
    const dynamicTestgenConfigId = getTestgenConfigInputId(state);
    const error = getError(state);
    const isLoading = getIsLoading(state);
    const errors = error ? [error] : [];

    return {
        errors,
        isLoading,
        initConfigInput,
        dynamicTestgenConfigId,
    };
};

const mapDispatchToProps = {
    createTestgenConfigInput: createTestgenConfigInput,
    submitTestgenConfigInput: submitTestgenConfigInput,
    fetchTestgenConfigInput: fetchTestgenConfigInput,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export const ConnectedTestgenConfigInput = connector(TestgenConfigInput);
