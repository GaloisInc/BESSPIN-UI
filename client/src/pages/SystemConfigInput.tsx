import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';

import {
    Alert,
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
import { LoadingIndicator } from '../components/LoadingIndicator';

import {
    getError,
    getIsLoading,
} from '../state/ui';

import {
    fetchSystemConfigInput,
    getSystemConfigInput,
    submitSystemConfigInput,
    ISystemConfigInput,
    updateSystemConfigInput,
} from '../state/feature-model';

import { IState } from '../state';

interface IStateFromProps {
    errors: string[];
    isLoading: boolean;
    sysConfig?: ISystemConfigInput;
    sysConfigId?: number;
    workflowId?: number;
}

interface IDispatchFromProps {
    createSystemConfig: typeof submitSystemConfigInput;
    fetchSystemConfigInput: typeof fetchSystemConfigInput;
    updateSystemConfig: typeof updateSystemConfigInput;
}

export type ISystemConfigInputProps  = IStateFromProps & IDispatchFromProps;

export const SystemConfigInput: React.FC<ISystemConfigInputProps> = ({
    createSystemConfig,
    errors,
    fetchSystemConfigInput,
    isLoading,
    sysConfig,
    sysConfigId,
    updateSystemConfig,
    workflowId,
}) => {

    const fileInputRef = useRef(null);
    const [label, setLabel] = useState('');
    const [configFilename, setConfigFilename] = useState('');
    const [nixConfig, setNixConfig] = useState('');

    useEffect(() => {
        if (sysConfigId) {
            fetchSystemConfigInput(sysConfigId);
        }
    }, [sysConfigId, fetchSystemConfigInput]);

    useEffect(() => {
        if (sysConfig) {
            setLabel(sysConfig.label);
            setConfigFilename(sysConfig.nixConfigFilename);
            setNixConfig(sysConfig.nixConfig);
        }
    }, [sysConfig]);

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
        if (workflowId && nixConfig) {
            const trimmedLabel = label.trim();

            sysConfig ?
                updateSystemConfig({
                    id: sysConfig.id,
                    createdAt: sysConfig.createdAt,
                    workflowId,
                    label: trimmedLabel,
                    nixConfigFilename: configFilename,
                    nixConfig,
                }) :
                createSystemConfig({
                    workflowId,
                    label: trimmedLabel,
                    nixConfigFilename: configFilename,
                    nixConfig: nixConfig
                });
        }
    }, [label, workflowId, configFilename, nixConfig, createSystemConfig, updateSystemConfig, sysConfig]);

    return (
        <Container className='SystemConfigInput'>
            <Header />
            <h1>System Configuration</h1>
            <Container className='sysconfig-form'>
                { isLoading && <LoadingIndicator /> }
                { errors && errors.length > 0 && <Alert variant='danger'>{ <ul>{errors.map((e, i) => (<li key={`error-${i}`}>{e}</li>))} </ul> }</Alert> }
                <Form>
                    <Form.Group as={Row}>
                        <Form.Label column sm={2}>Name</Form.Label>
                        <Col sm={10}>
                            <Form.Control
                                className='new-sysconfig-label'
                                type='input'
                                value={ label }
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLabel(e.target.value) } />
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
                                        text={ configFilename }
                                        accept='.nix' />
                                    <Form.Label className='custom-file-label'>{ configFilename }</Form.Label>
                                </div>
                            </InputGroup>
                        </Col>
                    </Form.Group>
                </Form>
            </Container>
            <AceEditor
                className='config-viewer'
                mode='json'
                name='editor-configs'
                onChange={ (newConfig) => setNixConfig(newConfig) }
                setOptions={{ useWorker: false }}
                theme='monokai'
                value={ nixConfig }
                width='100%'
                height='65vh' />
            <Container className='sysconfig-form'>
                <Form>
                    <Form.Group as={Row}>
                        <Col sm={10}>
                            <Button
                                className='submit-config btn btn-light btn-outline-secondary'
                                onClick={ onSubmitHandler }>
                                <FontAwesomeIcon icon={ faPlus }/>
                                <span> Upload Config </span>
                            </Button>
                        </Col>
                    </Form.Group>
                </Form>
            </Container>
        </Container>
    );
};

interface IMatchParams {
    workflowId?: string;
    systemConfigId?: string;
}

interface IOwnProps {
    match: { params: IMatchParams; path: string; };
}

const mapStateToProps = (state: IState, ownProps: IOwnProps): IStateFromProps => {
    const {
        match: {
            params,
            path,
        },
    } = ownProps;
    const workflowId = params.workflowId && Number(params.workflowId);
    const sysConfigId = params.systemConfigId && Number(params.systemConfigId);
    const isEditView = /edit/.test(path);
    const sysConfig = getSystemConfigInput(state);
    const error = getError(state);
    const isLoading = getIsLoading(state);

    const errors = error ? [error] : [];

    if (!workflowId) errors.push('Missing or invalid workflow in the URL');
    if (isEditView && !sysConfigId) errors.push('Missing or invalid system configuration in the URL');

    return {
        errors,
        isLoading,
        ...( workflowId ? { workflowId } : null ),
        ...( isEditView && sysConfigId ? { sysConfigId } : null ),
        ...( isEditView && sysConfigId && sysConfig && sysConfig.id === sysConfigId ? { sysConfig } : null ),
    };
};

const mapDispatchToProps = {
    createSystemConfig: submitSystemConfigInput,
    fetchSystemConfigInput,
    updateSystemConfig: updateSystemConfigInput,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export const ConnectedSystemConfigInput = connector(SystemConfigInput);
