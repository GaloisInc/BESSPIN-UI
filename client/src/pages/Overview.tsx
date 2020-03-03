import React, { useEffect, useState } from 'react';
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

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone, faEdit } from '@fortawesome/free-solid-svg-icons';

import { IState } from '../state';

import {
  cloneWorkflow,
  getWorkflowIds,
  getWorkflowsMap,
  submitWorkflow,
  fetchWorkflows,
  IWorkflow,
  triggerReport,
  updateWorkflow,
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

const formatDateTime = (dateTime: string): string => {
  return (new Date(dateTime)).toUTCString();
};

interface IStateFromProps {
  workflows: IWorkflow[];
  isLoading: boolean;
  dataRequested: boolean;
}

interface IDispatchFromProps {
  createWorkflow: typeof submitWorkflow;
  cloneWorkflow: typeof cloneWorkflow;
  updateWorkflow: typeof updateWorkflow;
  triggerReport: typeof triggerReport;
  fetchWorkflows: typeof fetchWorkflows;
}

export type IOverviewProps  = IStateFromProps & IDispatchFromProps;

export const Overview: React.FC<IOverviewProps> = ({
  dataRequested,
  isLoading,
  workflows,
  fetchWorkflows,
  createWorkflow,
  cloneWorkflow,
  triggerReport,
  updateWorkflow,
}) => {

  useEffect(() => {
    dataRequested || fetchWorkflows();
  });

  const [workflowLabel, setWorkflowLabel] = useState('');
  const [showWorkflowEditor, setShowWorkflowEditor] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editWorkflow, setEditWorkflow] = useState<IWorkflow | null>(null);

  return (
    <Container className='Overview'>
      <Header />
      {isLoading && <LoadingIndicator />}
      <Modal className='workflow-editor' show={showWorkflowEditor} onHide={() => setShowWorkflowEditor(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{ isEditMode ? 'Update' : 'Create New' } Workflow</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group as={Row}>
              <Form.Label column sm={2}>Name</Form.Label>
              <Col sm={10}>
                <Form.Control
                  className='new-workflow-label'
                  type='input'
                  value={ workflowLabel }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWorkflowLabel(e.target.value)} />
              </Col>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowWorkflowEditor(false)}>Cancel</Button>
          <Button className='create-new-workflow' variant='primary' onClick={() => {
            isEditMode && editWorkflow ? updateWorkflow({
              id: editWorkflow.id,
              label: workflowLabel
            }) : createWorkflow(workflowLabel);
            setIsEditMode(false);
            setShowWorkflowEditor(false);
            setWorkflowLabel('');
          }}>{ isEditMode ? 'Update' : 'Create' }</Button>
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
            <th>Clone</th>
          </tr>
        </thead>
        <tbody>
          {workflows && workflows.map((w, i) => (
            <tr className='workflow-row' key={`workflow-${i}`}>
              <td className='align-middle'>
                {w.id}
                <Button
                  className='edit'
                  variant='link'
                  block={ false }
                  size='sm'
                  onClick={() => {
                    setIsEditMode(true);
                    setEditWorkflow(w);
                    setWorkflowLabel(w.label)
                    setShowWorkflowEditor(true);
                }}>
                  <FontAwesomeIcon className='far' icon={faEdit}/>
                </Button>
              </td>
              <td className='label align-middle'>{w.label}</td>
              <td className='align-middle'>{formatDateTime(w.createdAt)}</td>
              <td className='align-middle'>{w.updatedAt ? formatDateTime(w.updatedAt) : ''}</td>
              <td className='align-middle'>
                <ButtonGroup>
                  <SystemConfigButton workflowId={w.id} config={w.systemConfig} />
                  <TestConfigButton workflowId={w.id} config={w.testConfig} />
                </ButtonGroup>
              </td>
              <td className='align-middle'>
                <ReportButton
                  disabled={reportShouldBeDisabled(w)}
                  workflowId={w.id}
                  onClick={ (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                    if (w.reports.length === 0) {
                      e.preventDefault();
                      triggerReport(w.id, w.label);
                    }
                  }}
                  config={w.reports[0]} />
              </td>
              <td className='align-middle'>
                <Button
                  className='clone'
                  variant='outline-secondary'
                  onClick={() => cloneWorkflow(w.id)}>
                  <FontAwesomeIcon className='far' icon={faClone} />
                </Button>
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

const mapDispatchToProps = {
  createWorkflow: submitWorkflow,
  cloneWorkflow,
  fetchWorkflows,
  triggerReport,
  updateWorkflow,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export const ConnectedOverview = connector(Overview);
