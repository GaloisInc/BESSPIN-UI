import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { match } from 'react-router-dom';

import {
    InputGroup,
    Col,
    Container,
    Form,
} from 'react-bootstrap';

import { IState } from '../state';
import { getDataRequested } from '../state/ui';

import {
    fetchSystem,
    getCurrentSelections,
    getSystems,
    ISelectionMap,
    ISystemEntry,
    selectFeature,
    submitSystem,
} from '../state/system';

import { Header } from '../components/Header';
import { Graph } from '../components/Graph';
import { IFeatureModel } from '../components/graph-helper';

import '../style/ConfigureCpu.scss';

export interface IConfigureCpuProps {
    dataRequested: boolean;
    submitSystem: typeof submitSystem;
    fetchSystem: typeof fetchSystem;
    system?: ISystemEntry;
    selections?: ISelectionType[];
    systemUid: string;
    selectFeature: typeof selectFeature;
}

const DEFAULT_FEATURE_MODEL: IFeatureModel = {
    constraints: [],
    features: {},
    roots: [],
    version: { base: 1 },
};

export const ConfigureCpu: React.FC<IConfigureCpuProps> = ({
    submitSystem,
    fetchSystem,
    system,
    selections,
    systemUid,
    selectFeature,
}) => {

    // NOTE: I prefer functional components and use React Hooks to manage form
    //       state. However, this makes testing interactions that use state
    //       very difficult
    const fileInputRef = useRef(null);
    const [configuratorModel, setConfiguratorModel] = useState(DEFAULT_FEATURE_MODEL);
    const [modelName, setModelName] = useState('');

    useEffect(() => {
        if (systemUid && (!system || !system.conftree)) {
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
            <Graph
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
    const systems = getSystems(state);
    const selections = getSelections(state);
    const dataRequested = getDataRequested(state);

    return {
        ...props,
        dataRequested,
        systemUid,
        system: systems[systemUid],
        selections,
    };
};

const mapDispatchToProps = {
    submitSystem,
    fetchSystem,
    selectFeature,
};

export const ConnectedConfigureCpu = connect(mapStateToProps, mapDispatchToProps)(ConfigureCpu);
