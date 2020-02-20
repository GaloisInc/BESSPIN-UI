import React, { useEffect, useState } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux'

import {
  Button,
  ButtonGroup,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Table,
} from 'react-bootstrap';

import { IState } from '../state';

import {
  getWorkflowIds,
  getWorkflowsMap,
  submitWorkflow,
  fetchWorkflows,
  IWorkflow,
  triggerReport,
} from '../state/workflow';

import {
  getIsLoading,
  getDataRequested,
} from '../state/ui';

import { Header } from '../components/Header';
import { LoadingIndicator } from '../components/LoadingIndicator';
import {
  ReportButton,
  SystemConfigButton,
  TestConfigButton,
} from '../components/WorkflowButton';

import '../style/Overview.scss';

const reportShouldBeDisabled = (workflow: IWorkflow): boolean => {
  if (!workflow.systemConfig) return true;
  if (workflow.systemConfig.error) return true;
  if (workflow.systemConfig && !workflow.testConfig) return true;
  if (workflow.testConfig && workflow.testConfig.error) return true;

  return false;
};

interface IStateFromProps {
  workflows: IWorkflow[];
  isLoading: boolean;
  dataRequested: boolean;
}

interface IDispatchFromProps {
  dispatch: Dispatch;
  createWorkflow: (_: string) => void;
  triggerReport: typeof triggerReport;
}

export type IOverviewProps  = IStateFromProps & IDispatchFromProps;

export const Overview: React.FC<IOverviewProps> = ({
  dataRequested,
  dispatch,
  isLoading,
  workflows,
  createWorkflow,
  triggerReport,
}) => {

  useEffect(() => {
    dataRequested || (dispatch && dispatch(fetchWorkflows()));
  });

  const [newWorkflow, setNewWorkflow] = useState('');
  const [showWorkflowEditor, setShowWorkflowEditor] = useState(false);

  return (
    <Container className='Overview'>
      <Header />
      {isLoading && <LoadingIndicator />}
      <Modal className='workflow-editor' show={showWorkflowEditor} onHide={() => setShowWorkflowEditor(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Workflow</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group as={Row}>
              <Form.Label column sm={2}>Name</Form.Label>
              <Col sm={10}>
                <Form.Control
                  className='new-workflow-label'
                  type='input'
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => setNewWorkflow(e.target.value)} />
              </Col>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowWorkflowEditor(false)}>Cancel</Button>
          <Button className='create-new-workflow' variant='primary' onClick={() => {
            createWorkflow(newWorkflow);
            setShowWorkflowEditor(false);
          }}>Create</Button>
        </Modal.Footer>
      </Modal>
      <h1>Overview</h1>
      <Container className='overview-header'>
        <Button className='new-workflow' onClick={() => setShowWorkflowEditor(true)}>New Workflow</Button>
      </Container>
      <Table striped bordered hover variant='light'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Label</th>
            <th>Created At</th>
            <th>Last Updated</th>
            <th>Configurations</th>
            <th>Report</th>
          </tr>
        </thead>
        <tbody>
          {workflows && workflows.map((w, i) => (
            <tr className='workflow-row' key={`workflow-${i}`}>
              <td>{w.id}</td>
              <td className='label'>{w.label}</td>
              <td>{w.createdAt}</td>
              <td>{w.updatedAt || ''}</td>
              <td>
                <ButtonGroup>
                  <SystemConfigButton workflowId={w.id} config={w.systemConfig} />
                  <TestConfigButton workflowId={w.id} config={w.testConfig} />
                </ButtonGroup>
              </td>
              <td>
                <ReportButton
                  disabled={reportShouldBeDisabled(w)}
                  workflowId={w.id}
                  onClick={ (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                    if (!w.report) {
                      e.preventDefault();
                      triggerReport(w.id, w.label);
                    }
                  }}
                  config={w.report} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

const mapStateToProps = (state: IState): IStateFromProps => {
  const workflowsById = getWorkflowsMap(state);
  const workflowIds = getWorkflowIds(state);
  const workflows = workflowIds.map((id) => workflowsById[id]);

  return {
    dataRequested: getDataRequested(state),
    isLoading: getIsLoading(state),
    workflows,
  };
};

const mapDispatchToProps = (dispatch: Dispatch): IDispatchFromProps => ({
  dispatch,
  createWorkflow: (label: string) => dispatch(submitWorkflow(label)),
  triggerReport: (workflowId: number, workflowLabel: string) => dispatch(triggerReport(workflowId, workflowLabel)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export const ConnectedOverview = connector(Overview);
