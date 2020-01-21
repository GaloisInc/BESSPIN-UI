import React, { useCallback, useRef, useState } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import {
    Button,
    Col,
    Container,
    Form,
    InputGroup,
    Row,
} from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-json';

import '../style/SystemConfigInput.scss';

import { Header } from '../components/Header';

import {
    submitSystemConfigInput,
    INewSystemConfigInput,
} from '../state/system';

import { IState } from '../state';

interface IStateFromProps {
  workflowId: number;
}

interface IDispatchFromProps {
  createSystemConfig: typeof submitSystemConfigInput;
}

export type ISystemConfigInputProps  = IStateFromProps & IDispatchFromProps;

export const SystemConfigInput: React.FC<ISystemConfigInputProps> = ({ workflowId, createSystemConfig }) => {

    const fileInputRef = useRef(null);
    const [label, setLabel] = useState('');
    const [configFilename, setConfigFilename] = useState('');
    const [nixConfig, setNixConfig] = useState('');

    const nixConfigInputCallback = useCallback(() => {
        // @ts-ignore - typescript does not like the ref, so I gave up and just ignore this line
        const fileToRead = fileInputRef.current.files[0];

        if (fileToRead) {
            setConfigFilename(fileToRead.name);

            const reader = new FileReader();
            reader.readAsText(fileToRead);
            reader.onload = (e) => {
                const nixConfigString = e && e.target ? e.target.result as string : null;
                if (nixConfigString) {
                    setNixConfig(nixConfigString);
                }
            };
        }
    }, []);

    const onSubmitHandler = useCallback(() => {
        if (nixConfig) {
            createSystemConfig({ workflowId, label, filename: configFilename, config: nixConfig });
        }
    }, [label, workflowId, configFilename, nixConfig, createSystemConfig]);

    return (
        <Container className='SystemConfigInput'>
            <Header />
            <h1>System Configuration</h1>
            <Container className='sysconfig-form'>
                <Form>
                    <Form.Group as={Row}>
                        <Form.Label column sm={2}>Name</Form.Label>
                        <Col sm={10}>
                            <Form.Control
                            className='new-sysconfig-label'
                            type='input'
                            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => setLabel(e.target.value.trim()) } />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label column sm={2}>Nix Config</Form.Label>
                        <Col sm={10}>
                            <InputGroup>
                                <div className='custom-file'>
                                    <Form.Control
                                        as='input'
                                        type='file'
                                        id='new-nix-config-upload-input'
                                        className='custom-file-input'
                                        aria-describedby='new-nix-config-upload'
                                        onChange={ nixConfigInputCallback }
                                        ref={ fileInputRef }
                                        accept='.nix' />
                                    <Form.Label className='custom-file-label'>{ configFilename }</Form.Label>
                                </div>
                            </InputGroup>
                        </Col>
                        <Col sm={10}>
                            <Button
                                className='btn btn-light btn-outline-secondary'
                                onClick={ onSubmitHandler }>
                                <FontAwesomeIcon icon={ faPlus }/>
                                <span> Upload Config </span>
                            </Button>
                        </Col>
                    </Form.Group>
                </Form>
            </Container>
            <AceEditor
                className='config-viewer'
                mode='json'
                name='editor-configs'
                readOnly={ true }
                setOptions={{ useWorker: false }}
                theme='monokai'
                value={ nixConfig }
                width='100%' />
        </Container>
    );
};

interface IMatchParams {
    workflowId?: string;
}

interface IOwnProps {
    match: { params: IMatchParams; };
}

const mapStateToProps = (state: IState, ownProps: IOwnProps): IStateFromProps => {
    const workflowId = ownProps.match.params.workflowId ? Number(ownProps.match.params.workflowId) : -1; // TODO: MORE ROBUST...
    return {
        workflowId: workflowId,
    };
};

const mapDispatchToProps = (dispatch: Dispatch): IDispatchFromProps => ({
    createSystemConfig: (config: INewSystemConfigInput) => dispatch(submitSystemConfigInput(config)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export const ConnectedSystemConfigInput = connector(SystemConfigInput);
