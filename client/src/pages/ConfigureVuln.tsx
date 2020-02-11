import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { match, useParams } from 'react-router-dom';

import {
    Col,
    Container,
    ButtonGroup,
    Button,
    Row,
} from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faRedo } from '@fortawesome/free-solid-svg-icons';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-json';

import { IState } from '../state';
import { getDataRequested } from '../state/ui';

import {
    fetchSystem,
    getSystem,
    IFeatureModelRecord,
    submitValidateConfiguration,
    selectFeature,
    selectFeatureUndo,
    selectFeatureRedo,
} from '../state/feature-model';


import { Header } from '../components/Header';
import { Graph } from '../components/Graph';
import { IFeatureModel } from '../components/graph-helper';

import '../style/ConfigureVuln.scss';



export interface IConfigureVulnProps {
    dataRequested: boolean;
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

export const ConfigureVuln: React.FC<IConfigureVulnProps> = ({
    fetchSystem,
    selectFeature,
    selectFeatureUndo,
    selectFeatureRedo,
    submitValidateConfiguration,
    system,
    systemUid,
}) => {

    const { workflowId, testId, vulnClass } = useParams();

    useEffect(() => {
        if (systemUid && !system.uid ) {
            fetchSystem(systemUid);
        }
    }, [systemUid, fetchSystem, system]);

    return (
        <Container className='ConfigureVuln'>
            <Header />
            <h1>Configure Vulnerability { vulnClass }</h1>
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
            <Button
                    className="btn btn-primary"
                    onClick={ () => { submitValidateConfiguration(system.uid, system.configs) } }
            >
                    Validate
            </Button>
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

interface IConfigureVulnMapProps extends IConfigureVulnProps {
    match: match<TParams>;
}

const mapStateToProps = (state: IState, props: IConfigureVulnMapProps): IConfigureVulnProps => {
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
    fetchSystem,
    selectFeature,
    selectFeatureUndo,
    selectFeatureRedo,
    submitValidateConfiguration,
};

export const ConnectedConfigureVuln = connect(mapStateToProps, mapDispatchToProps)(ConfigureVuln);
