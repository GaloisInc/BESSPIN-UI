import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';

import {
    Alert,
    Button,
    ButtonToolbar,
    Card,
    Container,
    Dropdown,
    DropdownButton,
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
    JobStatus,
    triggerReport,
} from '../state/workflow';

import '../style/Report.scss'

interface IStateFromProps {
    dataRequested: boolean;
    errors: string[];
    isLoading: boolean;
    workflowLabel: string;
    reports: IReportConfig[];
    workflowId?: number;
}

interface IDispatchFromProps {
    fetchWorkflow: typeof fetchWorkflow;
    triggerReport: typeof triggerReport;
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

export const Report: React.FC<IReportProps> = ({
    dataRequested,
    fetchWorkflow,
    reports,
    triggerReport,
    workflowId,
    workflowLabel,
}) => {
    const aceRef = useRef<AceEditor>(null);

    const [currentReport, setCurrentReport] = useState(reports[0]);

    useEffect(() => {
        const editor  = aceRef && aceRef.current;
        if (editor && currentReport) {
            const logLineCount = currentReport && currentReport.log && currentReport.log.split(/\n/).length;
            if (logLineCount) scrollToLine(editor, logLineCount);
        }
    });

    useEffect(() => {
        if (!dataRequested && workflowId) fetchWorkflow(workflowId);
    });

    useEffect(() => {
        setCurrentReport(reports[0]);
    }, [reports]);

    const mapStatusToVariant = (status: JobStatus): 'success' | 'warning' | 'info' => {
        switch (status) {
            case JobStatus.Succeeded:
                return 'success';
            case JobStatus.Failed:
                return 'warning';
            case JobStatus.Running:
            default:
                return 'info';
        }
    };

    return (
        <Container className='Report'>
            <Header />
            <Card>
                <Card.Body>
                    <Card.Title>Report: {currentReport ? currentReport.label : '...'}</Card.Title>
                    <Card.Subtitle>Last run: {currentReport ? currentReport.createdAt : ''}</Card.Subtitle>
                    { currentReport && <Alert variant={mapStatusToVariant(currentReport.status)}>{currentReport.status}</Alert> }
                </Card.Body>
            </Card>
            <ButtonToolbar className='report-menu'>
                <DropdownButton title='Reports' className='report-dropdown' id={`report-dropdown-${workflowId}`}>
                    {
                        reports.map((r, i) => (
                            <Dropdown.Item
                                className='report-selector'
                                key={`report-${r.id}`}
                                onClick={(e: any) => {
                                    e.preventDefault();
                                    setCurrentReport(reports[i])
                                }}>{r.label}</Dropdown.Item>
                        ))
                    }
                </DropdownButton>
                <Button
                    className='rerun-report'
                    variant='outline-success'
                    key={`run-${currentReport ? currentReport.id : 0}`}
                    disabled={!currentReport || currentReport.status === JobStatus.Running}
                    onClick={(e: any) => {
                        e.preventDefault();
                        if (workflowId) triggerReport(workflowId, workflowLabel);
                }}>Run again</Button>
            </ButtonToolbar>
            <AceEditor
                ref={aceRef}
                className='report-viewer'
                mode='plain_text'
                cursorStart={10}
                name='report-log'
                readOnly={ true }
                setOptions={{ useWorker: false }}
                theme='monokai'
                value={ currentReport && currentReport.log }
                width='100%'
                height='85vh' />
        </Container>
    );
};

interface IOwnProps {
    match: {
        params: {
            workflowId: string;
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

    const parsedWorkflowId = workflowId ? parseInt(workflowId, 10) : undefined;
    const workflow = !!parsedWorkflowId ? getWorkflowById(state, parsedWorkflowId) : undefined;
    const errors = error ? [error] : [];

    return {
        dataRequested,
        errors,
        isLoading,
        workflowId: parsedWorkflowId,
        workflowLabel: (workflow && workflow.label) || '',
        reports: (workflow && workflow.reports) || [],
    };
};

const mapDispatchToProps: IDispatchFromProps = {
    fetchWorkflow,
    triggerReport,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export const ConnectedReport = connector(Report);