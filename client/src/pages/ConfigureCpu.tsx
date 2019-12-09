import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { match } from 'react-router-dom';

import {
    InputGroup,
    Col,
    Container,
    Form,
    ButtonGroup,
    Button,
} from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUndo, faRedo } from '@fortawesome/free-solid-svg-icons'

import { IState } from '../state';
import { getDataRequested } from '../state/ui';

import {
    fetchSystem,
    getSystems,
    getSystem,
    ISelectionMap,
    ISystemEntry,
    submitSystem,
    ISelectionType,
    SelectionMode,
    submitValidateConfiguration,
    ISelection,
    selectFeature,
    selectFeatureUndo,
    selectFeatureRedo,
} from '../state/system';


import { Header } from '../components/Header';
import { Graph } from '../components/Graph';
import { IFeatureModel } from '../components/graph-helper';

import '../style/ConfigureCpu.scss';

export interface IConfigureCpuProps {
    dataRequested: boolean;
    submitSystem: typeof submitSystem;
    fetchSystem: typeof fetchSystem;
    selectFeature: typeof selectFeature,
    selectFeatureUndo: typeof selectFeatureUndo,
    selectFeatureRedo: typeof selectFeatureRedo,
    submitValidateConfiguration: typeof submitValidateConfiguration;
    system: ISystemEntry;
    systemUid: string;
}

const DEFAULT_FEATURE_MODEL: IFeatureModel = {
    constraints: [],
    features: {},
    roots: [],
    version: { base: 1 },
};


const mapSelectionsByUid = (selections: ISelectionType[]): ISelectionMap => {
    return selections.reduce((acc: ISelectionMap, s: ISelectionType) => {
        if (!acc[s.uid]) acc[s.uid] = s;
        return acc;
    }, {})
};

export const ConfigureCpu: React.FC<IConfigureCpuProps> = ({
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
    const [configuratorModel, setConfiguratorModel] = useState(DEFAULT_FEATURE_MODEL);
    const [modelName, setModelName] = useState('');

    useEffect(() => {
        if (systemUid && !system.uid ) {
            fetchSystem(systemUid);
        } else if (system && system.conftree) {
            setConfiguratorModel(system.conftree);
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
                    const configModelAsJSON = JSON.parse(configuratorModelString);
                    console.log(configModelAsJSON);
                    setConfiguratorModel(configModelAsJSON);
                }
            };
        }
    }, []);

    const onSubmitHandler = useCallback(() => {
        if (configuratorModel) {
            // TODO: pass model object rather than string
            submitSystem(modelName, JSON.stringify(configuratorModel));
        }
    }, [modelName, configuratorModel, submitSystem]);

    return (
        <Container className='ConfigureCpu'>
            <Header />
            <h1>Configure CPU</h1>
            <Form inline={ true }>
                <Form.Row>
                    <Col>
                        <InputGroup>
                            <InputGroup.Prepend onClick={ onSubmitHandler }>
                                <InputGroup.Text id='new-model-upload'>Upload Model</InputGroup.Text>
                            </InputGroup.Prepend>
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
                </Form.Row>
            </Form>
            <ButtonGroup className="mr-2" aria-label="First group">
                <Button
                    onClick={ () => {
                        selectFeatureUndo(systemUid);
                    } }
                >
                    <FontAwesomeIcon icon={faUndo} />
                    Undo
                </Button>
                <Button
                    onClick={ () => {
                        selectFeatureRedo(systemUid);
                    } }
                >
                    Redo
                    <FontAwesomeIcon icon={faRedo} />
                </Button>
            </ButtonGroup>
            <Button
                    onClick={ () => { submitValidateConfiguration(system.uid, system.configs) } }
            >
                    Validate
            </Button>
            <Graph
                system={ system }
                data={ configuratorModel }
                selectFeature={ selectFeature }
            />
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
    const systemUid = props.match.params.systemUid || '';
    const system = getSystem(state);
    const dataRequested = getDataRequested(state);

    return {
        ...props,
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
