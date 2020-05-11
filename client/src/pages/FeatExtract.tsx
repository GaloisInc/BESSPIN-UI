// @ts-check
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import {
    Alert,
    Button,
    ButtonGroup,
    ButtonToolbar,
    Container,
    Form,
    Col,
    Row,
} from 'react-bootstrap';

import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-json';
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/snippets/python";

import '../style/FeatExtract.scss';

import { Header } from '../components/Header';
import { LoadingIndicator } from '../components/LoadingIndicator';

import {
    getError,
    getIsLoading,
} from '../state/ui';

import {
    IFeatExtractRecord,
    IFeatExtractListElem,
    listFeatExtract,
    fetchFeatExtract,
    newFeatExtract,
    submitFeatExtract,
    runFeatExtract,
    simplifyFeatExtract,
    getFeatExtractIdList,
    getFeatExtractRecord,
} from '../state/featExtract'

import { IState } from '../state';


interface IStateFromProps {
    errors: string[];
    isLoading: boolean;
    featExtractIdList?: IFeatExtractListElem[];
    featExtractRecord: IFeatExtractRecord;
}

interface IDispatchFromProps {
    listFeatExtract: typeof listFeatExtract;
    fetchFeatExtract: typeof fetchFeatExtract;
    newFeatExtract: typeof newFeatExtract;
    submitFeatExtract: typeof submitFeatExtract;
    runFeatExtract: typeof runFeatExtract;
    simplifyFeatExtract: typeof simplifyFeatExtract;
}

export type IProps  = IStateFromProps & IDispatchFromProps;

interface IChoiceProps {
    onSelect: (_:string) => void;
    list: number[];
}


const downloadTxtFile = (theText: string, filename: string): void => {
    const element = document.createElement("a");
    const file = new Blob([theText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
}

export const FeatExtract: React.FC<IProps> = ({
    errors,
    isLoading,
    featExtractIdList,
    featExtractRecord,

    listFeatExtract,
    fetchFeatExtract,
    newFeatExtract,
    submitFeatExtract,
    runFeatExtract,
    simplifyFeatExtract,
}) => {

    const [editorText, setEditorText] = useState('');
    const [loadExisting, setLoadExisting] = useState(-42);
    const [cpuTemplate, setCpuTemplate] = useState('');
    const [newLabel, setNewLabel] = useState('');
    const [editorFMText, setEditorFMText] = useState('');
    const [editorFMTextSimplified, setEditorFMTextSimplified] = useState('');

    useEffect(() => {
        if (featExtractIdList === undefined) {
            listFeatExtract();
        }
    }, [featExtractIdList, listFeatExtract]);

    useEffect(() => {
        if (featExtractRecord) {
            setEditorText(featExtractRecord.featExtractInput);
        }
    }, [featExtractRecord]);

    useEffect(() => {
        if (featExtractRecord.featExtractOutputContentClafer) {
            setEditorFMText(featExtractRecord.featExtractOutputContentClafer);
        }
    }, [featExtractRecord]);

    useEffect(() => {
        if (featExtractRecord.featExtractOutputContentClaferSimplified) {
            setEditorFMTextSimplified(featExtractRecord.featExtractOutputContentClaferSimplified);
        }
    }, [featExtractRecord]);

    return (
        <Container className='FeatExtract'>
            <Header />
            <h1>Feature Extraction</h1>
            <Container className='load-feat-extract'>
                { isLoading && <LoadingIndicator /> }
                { errors && errors.length > 0 && <Alert variant='danger'>{ <ul>{errors.map((e, i) => (<li key={`error-${i}`}>{e}</li>))} </ul> }</Alert> }
                <h2> Session </h2>
                <Form>
                    <Form.Group controlId='SelectListOfFeatExtract'>
                        <Form.Label></Form.Label>
                        <Form.Control as='select' onClick={ (event:any) => setLoadExisting(event.target.value) }>
                            { ((featExtractIdList === undefined) ? [] : featExtractIdList).map((value, index, array) => <option value={value.featExtractId}> {value.featExtractId} - {value.label} </option>) }
                        </Form.Control>
                    </Form.Group>
                </Form>
                <ButtonToolbar>
                <ButtonGroup className='mr-2' aria-label='First group'>
                <Button
                    onClick={() => fetchFeatExtract(loadExisting) }
                    disabled={(loadExisting === -42)? true : false}
                    variant={(featExtractRecord.featExtractId > 0) ? 'secondary' : 'primary'}
                >
                    Load
                </Button>
                </ButtonGroup>
                </ButtonToolbar>
                <Form>
                    <Form.Row>
                        <Form.Group as={Col} controlId='formGridTemplate'>
                        <Form.Label>CPU Template</Form.Label>
                        <Form.Control as='select' onClick={ (event:any) => setCpuTemplate(event.target.value)}>
                            <option value='piccolo'>piccolo</option>
                        </Form.Control>
                        </Form.Group>

                        <Form.Group as={Col} controlId='formGridLabel'>
                        <Form.Label>Label</Form.Label>
                        <Form.Control onChange={(event:any) => setNewLabel(event.target.value)}/>
                        </Form.Group>
                    </Form.Row>
                </Form>
                <Button
                    className='mr-1'
                    onClick={() => newFeatExtract(cpuTemplate, newLabel, false) }
                    disabled={(cpuTemplate === '')? true : false}
                >
                    New
                </Button>
                <Button
                    className='button-new-prebuilt'
                    onClick={() => newFeatExtract(cpuTemplate, newLabel, true) }
                    disabled={(cpuTemplate === '')? true : false}
                >
                    New from pre-built
                </Button>
            </Container>
            <hr />
            <Container className='edit-feat-extract-input'>
                <h2> Edit config file </h2>
                <ButtonGroup>
                    <Button
                        className='btn-space'
                        onClick={() => submitFeatExtract(featExtractRecord.featExtractId, editorText) }
                        disabled={(featExtractRecord.featExtractId > 0)? false : true}
                    >
                        Save
                    </Button>
                </ButtonGroup>

                <AceEditor
                    mode='python'
                    name='editor-feat-extract'
                    theme='monokai'
                    onChange={ (newValue) => setEditorText(newValue) }
                    value={ editorText }
                    width='100%'
                    height='30vh' />
            </Container>
            <Container>
            <h2> Build </h2>
            <Row className="justify-content-md-center">
                <Col>
                <ButtonGroup>
                <Button
                    onClick={() => runFeatExtract(featExtractRecord.featExtractId) }
                    disabled={(featExtractRecord.featExtractId > 0)? false: true}
                >
                    Build
                </Button>
                <Button
                    className="btn btn-dark"
                    onClick={() =>
                        downloadTxtFile(
                            featExtractRecord.featExtractOutputContent ? featExtractRecord.featExtractOutputContent : '',
                            featExtractRecord.featExtractOutputFilename + '.fm.json')}
                    disabled = {(featExtractRecord.featExtractOutputContent && featExtractRecord.featExtractOutputFilename) ? false : true}
                >
                    Download .fm.json
                </Button>
                </ButtonGroup>
                </Col>
                <Col>
                <ButtonGroup>
                <Button
                    onClick={() => simplifyFeatExtract(featExtractRecord.featExtractId) }
                    disabled={(featExtractRecord.featExtractOutputContent) ? false: true}
                >
                    Simplify
                </Button>
                <Button
                    className="btn btn-dark"
                    onClick={() =>
                        downloadTxtFile(
                            featExtractRecord.featExtractOutputContentSimplified ? featExtractRecord.featExtractOutputContentSimplified : '',
                            featExtractRecord.featExtractOutputFilenameSimplified + '.fm.json')}
                    disabled = {(featExtractRecord.featExtractOutputContentClaferSimplified && featExtractRecord.featExtractOutputFilenameSimplified) ? false : true}
                >
                    Download Simplified .fm.json
                </Button>
                </ButtonGroup>
                </Col>
            </Row>
            </Container>

            { (featExtractRecord.featExtractOutputContent) ?
                <Row>
                <Col>
                <Container className='edit-feat-extract-input'>
                <AceEditor
                    mode='python'
                    name='editor-feat-extract'
                    theme='monokai'
                    value={ editorFMText }
                    width='100%'
                    height='35vh' />
                </Container>
                </Col>
                <Col>
                { (featExtractRecord.featExtractOutputContentSimplified) ?
                <Container className='edit-feat-extract-input'>
                <AceEditor
                    mode='python'
                    name='editor-feat-extract'
                    theme='monokai'
                    value={ editorFMTextSimplified }
                    width='100%'
                    height='35vh' />
                </Container> :
                ''
                }
                </Col>
                </Row> :
                ''
            }
        </Container>
    );
};

const mapStateToProps = (state: IState): IStateFromProps => {
    const error = getError(state);
    const isLoading = getIsLoading(state);
    const errors = error ? [error] : [];

    const featExtractIdList = getFeatExtractIdList(state);
    const featExtractRecord = getFeatExtractRecord(state);

    return {
        errors,
        isLoading,
        featExtractIdList,
        featExtractRecord,
    };
};

const mapDispatchToProps = {
    listFeatExtract,
    fetchFeatExtract,
    newFeatExtract,
    submitFeatExtract,
    runFeatExtract,
    simplifyFeatExtract,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export const ConnectedFeatExtract = connector(FeatExtract);
