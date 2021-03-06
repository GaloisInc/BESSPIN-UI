import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { match } from 'react-router-dom';

import {
    Alert,
    InputGroup,
    Col,
    Container,
    Form,
    ButtonGroup,
    Button,
    Row,
} from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faRedo, faPlus, faDownload } from '@fortawesome/free-solid-svg-icons';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-json';

import { IState } from '../state';
import { getDataRequested } from '../state/ui';

import {
    getError,
    getIsLoading,
} from '../state/ui';

import {
    fetchSystem,
    getSystem,
    IFeatureModelRecord,
    submitSystem,
    submitValidateConfiguration,
    selectFeature,
    selectFeatureUndo,
    selectFeatureRedo,
} from '../state/feature-model';


import { Header } from '../components/Header';
import { Graph } from '../components/Graph';
import { IFeatureModel } from '../components/graph-helper';
import { LoadingIndicator } from '../components/LoadingIndicator';

import '../style/ConfigureCpu.scss';

export interface IConfigureCpuProps {
    errors: string[];
    isLoading: boolean;
    dataRequested: boolean;
    submitSystem: typeof submitSystem;
    fetchSystem: typeof fetchSystem;
    selectFeature: typeof selectFeature,
    selectFeatureUndo: typeof selectFeatureUndo,
    selectFeatureRedo: typeof selectFeatureRedo,
    submitValidateConfiguration: typeof submitValidateConfiguration;
    system: IFeatureModelRecord;
    systemUid: string;
}

export const DEFAULT_FEATURE_MODEL: IFeatureModel = {
    constraints: [],
    features: {},
    roots: [],
    version: { base: 1 },
};


const downloadTxtFile = (theText: string, filename: string): void => {
    const element = document.createElement("a");
    const file = new Blob([theText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
}

export const ConfigureCpu: React.FC<IConfigureCpuProps> = ({
    errors,
    isLoading,
    submitSystem,
    fetchSystem,
    selectFeature,
    selectFeatureUndo,
    selectFeatureRedo,
    submitValidateConfiguration,
    system,
    systemUid,
}) => {

    // NOTE: I prefer functional components and use React Hooks to manage form
    //       state. However, this makes testing interactions that use state
    //       very difficult
    const fileInputRef = useRef(null);
    const [configuratorModel, setConfiguratorModel] = useState("");
    const [modelName, setModelName] = useState('');

    useEffect(() => {
        if (systemUid && !system.uid ) {
            fetchSystem(systemUid);
        }
    }, [systemUid, fetchSystem, system]);

    const modelInputCallback = useCallback(() => {
        // @ts-ignore - typescript does not like the ref, so I gave up and just ignore this line
        const fileToRead = fileInputRef.current.files[0];

        if (fileToRead) {
            setModelName(fileToRead.name);

            const reader = new FileReader();
            reader.readAsText(fileToRead);
            reader.onload = (e) => {
                const configuratorModelString = e && e.target ? e.target.result as string : null;
                if (configuratorModelString) {
                    if (fileToRead.name.endsWith('.fm.json')) {
                        const configModelAsJSON = JSON.parse(configuratorModelString);
                        console.log(configModelAsJSON);
                        setConfiguratorModel(JSON.stringify(configModelAsJSON));
                    } else if (fileToRead.name.endsWith('.cfr')) {
                        setConfiguratorModel(configuratorModelString);
                    }
                }
            };
        }
    }, []);

    const onSubmitHandler = useCallback(() => {
        if (configuratorModel) {
            // TODO: pass model object rather than string
            submitSystem(modelName, configuratorModel);
        }
    }, [modelName, configuratorModel, submitSystem]);

    return (
        <Container className='ConfigureCpu'>

            <Header />
            <h1>Configure</h1>
            { isLoading && <LoadingIndicator /> }
            { errors && errors.length > 0 && <Alert variant='danger'>{ <ul>{errors.map((e, i) => (<li key={`error-${i}`}>{e}</li>))} </ul> }</Alert> }
            <Form inline={ true }>
                <Form.Row>
                    <Col>
                        <InputGroup>
                            <div className='custom-file'>
                                <Form.Control
                                    as='input'
                                    type='file'
                                    id='new-model-upload-input'
                                    className='custom-file-input'
                                    aria-describedby='new-model-upload'
                                    onChange={ modelInputCallback }
                                    ref={ fileInputRef }
                                    accept='.cfr,.json' />
                                <Form.Label className='custom-file-label'>{ modelName }</Form.Label>
                            </div>
                        </InputGroup>
                    </Col>
                    <Col>
                        <Button
                            className="btn btn-light btn-outline-secondary"
                            onClick={ onSubmitHandler }>
                            <FontAwesomeIcon icon={ faPlus }/>
                            <span> Upload Model </span>
                        </Button>
                    </Col>
                </Form.Row>
            </Form>
            <hr />
            <Row>
            <Col>
            <ButtonGroup className="mr-2" aria-label="First group">
                <Button
                    className="btn-light btn-outline-secondary"
                    onClick={ () => {
                        selectFeatureUndo();
                    } }
                >
                    <FontAwesomeIcon icon={faUndo} />
                    Undo
                </Button>
                <Button
                    className="btn-light btn-outline-secondary"
                    onClick={ () => {
                        selectFeatureRedo();
                    } }
                >
                    Redo
                    <FontAwesomeIcon icon={faRedo} />
                </Button>
            </ButtonGroup>
            </Col>
            <Col xs={6} md={4}>
            <Button
                    className="btn btn-primary"
                    onClick={ () => { submitValidateConfiguration(system.uid, system.configs) } }
            >
                    Validate
            </Button>
            </Col>
            <Col xs={6} md={4}>
            <Button
                className="btn btn-dark"
                onClick={() =>
                    downloadTxtFile(JSON.stringify(system.configuredConftree) , system.filename.split('.')[0] + '-configured.fm.json')}
                disabled = {(system.filename) ? false : true}
            >
                <FontAwesomeIcon icon={faDownload} />
                 Download Model
            </Button>
            </Col>
            </Row>
            <Graph
                system={ system }
                selectFeature={ selectFeature }
            />
            <Container>
                <Row>
                    <Col>
                        <AceEditor
                            mode='json'
                            theme='monokai'
                            name='editor-source'
                            value={ system && system.source ? system.source : '' }
                            readOnly={ true }
                            setOptions={{ useWorker: false }}
                        />
                    </Col>
                    <Col>
                        <AceEditor
                            mode='json'
                            theme='monokai'
                            name='editor-configs'
                            value={ system ? system.configsPP : '' }
                            readOnly={ true }
                            setOptions={{ useWorker: false }}
                        />
                    </Col>
                </Row>
            </Container>
        </Container>
    );
}

// NOTE: If you add more path-parameters to the <Route>, you will need to add
//       the parameters here
type TParams = { systemUid?: string };

interface IConfigureCpuMapProps extends IConfigureCpuProps {
    match: match<TParams>;
}

const mapStateToProps = (state: IState, props: IConfigureCpuMapProps): IConfigureCpuProps => {
    const error = getError(state);
    const isLoading = getIsLoading(state);
    const errors = error ? [error] : [];

    const systemUid = props.match.params.systemUid || '';
    const system = getSystem(state);
    const dataRequested = getDataRequested(state);

    return {
        ...props,
        errors,
        isLoading,
        dataRequested,
        system: system,
        systemUid,
    };
};

const mapDispatchToProps = {
    submitSystem,
    fetchSystem,
    selectFeature,
    selectFeatureUndo,
    selectFeatureRedo,
    submitValidateConfiguration,
};

export const ConnectedConfigureCpu = connect(mapStateToProps, mapDispatchToProps)(ConfigureCpu);
