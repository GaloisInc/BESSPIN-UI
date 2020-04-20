// @ts-check
import React, { useEffect, useState } from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { connect } from 'react-redux';

import {
    Alert,
    Button,
    ButtonGroup,
    ButtonToolbar,
    Container,
    Form,
    Col,
} from 'react-bootstrap';

import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-json';
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/snippets/python";

import '../style/ArchExtract.scss';

import { Header } from '../components/Header';
import { LoadingIndicator } from '../components/LoadingIndicator';

import {
    getError,
    getIsLoading,
} from '../state/ui';

import {
    IArchExtractRecord,
    IArchExtractOutputRecord,
    IArchExtractListElem,
    listArchExtract,
    fetchArchExtract,
    newArchExtract,
    submitArchExtract,
    runArchExtract,
    convertArchExtract,
    getArchExtractIdList,
    getArchExtractRecord,
    getArchExtractOutputRecord,
} from '../state/archExtract'


import { IState } from '../state';

interface IStateFromProps {
    errors: string[];
    isLoading: boolean;
    archExtractIdList?: IArchExtractListElem[];
    archExtractRecord: IArchExtractRecord;
    archExtractOutputRecord?: IArchExtractOutputRecord;
}

interface IDispatchFromProps {
    listArchExtract: typeof listArchExtract;
    fetchArchExtract: typeof fetchArchExtract;
    newArchExtract: typeof newArchExtract;
    submitArchExtract: typeof submitArchExtract;
    runArchExtract: typeof runArchExtract;
    convertArchExtract: typeof convertArchExtract;
}

export type IProps  = IStateFromProps & IDispatchFromProps;

interface IChoiceProps {
    onSelect: (_:string) => void;
    list: number[];
}

const PNG_DEFAULT = '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'
;

const IMAGE_PREFIX = 'data:image/png;base64,';

export const ArchExtract: React.FC<IProps> = ({
    errors,
    isLoading,
    archExtractIdList,
    archExtractRecord,
    archExtractOutputRecord,

    listArchExtract,
    fetchArchExtract,
    newArchExtract,
    submitArchExtract,
    runArchExtract,
    convertArchExtract,
}) => {

    const [editorText, setEditorText] = useState('');
    const [loadExisting, setLoadExisting] = useState(-42);
    const [cpuTemplate, setCpuTemplate] = useState('');
    const [newLabel, setNewLabel] = useState('');
    const [selectedDotFile, setSelectedDotFile] = useState(-42);

    useEffect(() => {
        if (archExtractIdList === undefined) {
            listArchExtract();
        }
    }, [archExtractIdList, listArchExtract]);

    useEffect(() => {
        if (archExtractRecord) {
            setEditorText(archExtractRecord.archExtractInput);
        }
    }, [archExtractRecord]);

    const png_dyn = (archExtractOutputRecord !== undefined) ?
        (IMAGE_PREFIX + archExtractOutputRecord.archExtractOutputContentConverted) :
        (IMAGE_PREFIX + PNG_DEFAULT);

    return (
        <Container className='ArchExtract'>
            <Header />
            <h1>Architecture Extraction</h1>
            <Container className='load-arch-extract'>
                { isLoading && <LoadingIndicator /> }
                { errors && errors.length > 0 && <Alert variant='danger'>{ <ul>{errors.map((e, i) => (<li key={`error-${i}`}>{e}</li>))} </ul> }</Alert> }
                <Form>
                    <Form.Group controlId='SelectListOfArchExtract'>
                        <Form.Label></Form.Label>
                        <Form.Control as='select' onChange={ (event:any) => setLoadExisting(event.target.value) }>
                            { ((archExtractIdList === undefined) ? [] : archExtractIdList).map((value, index, array) => <option value={value.archExtractId}> {value.archExtractId} - {value.label} </option>) }
                        </Form.Control>
                    </Form.Group>
                </Form>
                <ButtonToolbar>
                <ButtonGroup className='mr-2' aria-label='First group'>
                <Button
                    onClick={() => fetchArchExtract(loadExisting) }
                    disabled={(loadExisting === -42)? true : false}
                    variant={(archExtractRecord.archExtractId > 0) ? 'secondary' : 'primary'}
                >
                    Load
                </Button>
                </ButtonGroup>
                </ButtonToolbar>
                <Form>
                    <Form.Row>
                        <Form.Group as={Col} controlId='formGridLabel'>
                        <Form.Label>Label</Form.Label>
                        <Form.Control onChange={(event:any) => setNewLabel(event.target.value)}/>
                        </Form.Group>

                        <Form.Group as={Col} controlId='formGridTemplate'>
                        <Form.Label>CPU Template</Form.Label>
                        <Form.Control as='select' onClick={ (event:any) => setCpuTemplate(event.target.value)}>
                            <option value='piccolo'>piccolo</option>
                            <option value='piccolo-low-level'>piccolo-low-level</option>
                            <option value='piccolo-high-level'>piccolo-high-level</option>
                        </Form.Control>
                        </Form.Group>
                    </Form.Row>
                </Form>
                <Button
                    onClick={() => newArchExtract(cpuTemplate, newLabel) }
                    disabled={(cpuTemplate === '')? true : false}
                >
                    New
                </Button>
                <br />
            </Container>

            <Container className='edit-arch-extract-input'>
                <ButtonGroup>
                    <Button
                        onClick={() => submitArchExtract(archExtractRecord.archExtractId, editorText) }
                        disabled={(archExtractRecord.archExtractId > 0)? false : true}
                    >
                        Save
                    </Button>
                </ButtonGroup>

                <AceEditor
                    mode='python'
                    name='editor-arch-extract'
                    theme='monokai'
                    onChange={ (newValue) => setEditorText(newValue) }
                    value={ editorText }
                    width='100%'
                    height='35vh' />
                <Button
                    onClick={() => runArchExtract(archExtractRecord.archExtractId) }
                    disabled={(archExtractRecord.archExtractId > 0)? false: true}
                >
                    Build
                </Button>
            </Container>


            <Container className='convert-arch-extract'>
                <Form>
                    <Form.Group controlId='SelectArchExtractOuput'>
                        <Form.Label>Select dot file to convert to PNG: </Form.Label>
                        <Form.Control as='select' onClick={ (event:any) => setSelectedDotFile(event.target.value) }>
                            { (archExtractRecord.archExtractOutputList ?
                                archExtractRecord.archExtractOutputList: []
                                ).map((value, _index, _array) => <option value={value.archExtractOutputId}> {value.archExtractOutputFilename} </option>) }
                        </Form.Control>
                    </Form.Group>
                </Form>
                <Button
                    onClick={() => convertArchExtract(selectedDotFile) }
                    disabled={(selectedDotFile === -42)}
                >
                    Convert
                </Button>

                <Container className='converted-arch-extract'>
                    <div>
                        <TransformWrapper>
                        <TransformComponent>
                        { (archExtractOutputRecord !== undefined) ?
                            <img id='ItemPreview' alt='Preview Item' src={png_dyn}></img> :
                            <div />
                        }
                        </TransformComponent>
                        </TransformWrapper>
                    </div>
                </Container>
            </Container>
        </Container>
    );
};

const mapStateToProps = (state: IState): IStateFromProps => {
    const error = getError(state);
    const isLoading = getIsLoading(state);
    const errors = error ? [error] : [];

    const archExtractIdList = getArchExtractIdList(state);
    const archExtractRecord = getArchExtractRecord(state);
    const archExtractOutputRecord = getArchExtractOutputRecord(state);

    return {
        errors,
        isLoading,
        archExtractIdList,
        archExtractRecord,
        archExtractOutputRecord,
    };
};

const mapDispatchToProps = {
    listArchExtract,
    fetchArchExtract,
    newArchExtract,
    submitArchExtract,
    runArchExtract,
    convertArchExtract,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export const ConnectedArchExtract = connector(ArchExtract);
