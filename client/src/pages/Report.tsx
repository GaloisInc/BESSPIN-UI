import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';

import {
    Container,
} from 'react-bootstrap';

import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-plain_text'

import { Header } from '../components/Header';
import { IState } from '../state';

import {
    getError,
    getDataRequested,
    getIsLoading,
} from '../state/ui';

import {
    fetchWorkflow,
    getWorkflowById,
    IReportConfig,
} from '../state/workflow';

interface IStateFromProps {
    errors: string[];
    isLoading: boolean;
    report?: IReportConfig;
    dataRequested: boolean;
    workflowId?: number;
}

interface IDispatchFromProps {
    fetchWorkflow: typeof fetchWorkflow;
}

export type IReportProps  = IStateFromProps & IDispatchFromProps;

const scrollToLine = (ace: AceEditor, line: number): void => {
    if (ace.editor) {
        // https://stackoverflow.com/questions/23748743/ace-editor-go-to-line
        // not sure exactly _why_ this is required, but the SO link above was
        // the solution I found...
        ace.editor.resize(true);
        ace.editor.scrollToLine(line, true, true, () => {});
    }
};

export const Report: React.FC<IReportProps> = ({ dataRequested, fetchWorkflow, report, workflowId }) => {
    const aceRef = useRef<AceEditor>(null);

    useEffect(() => {
        const editor  = aceRef?.current;
        if (editor && report) {
            const logLineCount = report?.log?.split(/\n/).length;
            if (logLineCount) scrollToLine(editor, logLineCount);
        }
    });

    useEffect(() => {
        if (!dataRequested && workflowId) fetchWorkflow(Number(workflowId));
    });

    return (
        <Container className='Report'>
            <Header />
            <h1>Report</h1>
            <Container>
                <AceEditor
                    ref={aceRef}
                    className='report-viewer'
                    mode='plain_text'
                    cursorStart={10}
                    name='report-log'
                    readOnly={ true }
                    setOptions={{ useWorker: false }}
                    theme='monokai'
                    value={ report?.log }
                    width='100%'
                    height='85vh' />
            </Container>
        </Container>
    );
};

interface IOwnProps {
    match: {
        params: {
            workflowId: number;
        }
    }
}

const mapStateToProps = (state: IState, ownProps: IOwnProps): IStateFromProps => {
    const error = getError(state);
    const isLoading = getIsLoading(state);
    const dataRequested = getDataRequested(state);
    const {
        match: {
            params: {
                workflowId,
            }
        }
    } = ownProps;
    const workflow = getWorkflowById(state, workflowId);


    const errors = error ? [error] : [];

    return {
        dataRequested,
        errors,
        isLoading,
        workflowId,
        report: workflow?.report,
    };
};

const mapDispatchToProps: IDispatchFromProps = {
    fetchWorkflow,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export const ConnectedReport = connector(Report);