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
  OverlayTrigger,
  Row,
  Table,
  Popover,
  PopoverProps,
  Spinner,
} from 'react-bootstrap';

import { IState } from '../state';

import {
  getWorkflowIds,
  getWorkflowsMap,
  submitWorkflow,
  fetchWorkflows,
  IWorkflow,
  IConfig,
  IReportConfig,
  JobStatus,
} from '../state/workflow';

import {
  getIsLoading,
  getDataRequested,
} from '../state/ui';

import { Header } from '../components/Header';
import { LoadingIndicator } from '../components/LoadingIndicator';

import '../style/Overview.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'

// NOTE: Rendering buttons that represent a directed workflow involves
//       a fair amount of logic to map the state of a given workflow.
//       Right now we define all the types/components here, but we
//       should consider pulling them out into their own "components"
//       files once this UX is solidified
interface IWorkflowProps {
  workflowId?: number;
  config?: IConfig;
  disabled?: boolean;
}
interface IReportProps {
  workflowId?: number;
  config?: IReportConfig;
  disabled?: boolean;
}

interface IViewCreateButtonProps extends IWorkflowProps {
  label: string;
  path: string;
  noNextStep?: boolean;
  inProgress?: boolean;
}

interface IWorkflowButton {
  url: string;
  label: string;
  variant?: 'success' | 'warning' | 'danger';
  disabled?: boolean;
  noNextStep?: boolean;
  tooltipError?: string;
  inProgress?: boolean;
}

interface IErrorTooltipProps extends PopoverProps {
  label: string;
}

const WorkflowButton: React.FC<IWorkflowButton> = ({ url, label, variant, disabled, noNextStep, tooltipError, inProgress }) => {
  const renderTooltip: React.FC<IErrorTooltipProps> = (props) => (<Popover {...props} content={true}>{props.label}</Popover>);
  const variantType = (disabled ? 'secondary' : variant) || 'primary';

  return tooltipError ?
    <OverlayTrigger placement='bottom' overlay={(props: IErrorTooltipProps) => renderTooltip({ ...props, label: tooltipError })}>
      <Button disabled={disabled} variant='danger' href={url}>{label}</Button>
    </OverlayTrigger>
    : (
      <Button disabled={disabled} variant={variantType} href={url}>
        { inProgress && <Spinner as='span' animation='grow' size='sm' role='status' aria-hidden='true' /> }
        {label}
        {!(disabled || noNextStep ) && variantType !== 'primary' && <FontAwesomeIcon icon={faChevronRight} />
        }</Button>
    );
};

const CreateEditButton: React.FC<IViewCreateButtonProps> = ({ workflowId, config, path, disabled, label, noNextStep, inProgress }) => {
  if (config) {
    return <WorkflowButton
      disabled={disabled}
      label={label}
      noNextStep={noNextStep}
      tooltipError={config.error && config.error.message}
      url={`${path}/edit/${workflowId}/${config.id}`}
      variant={ inProgress ? 'warning' : 'success' }
      inProgress={inProgress}
    />;
  } else {
    return <WorkflowButton label={label} url={`${path}/create/${workflowId}`} disabled={disabled} noNextStep={noNextStep} />;
  }
};

const SystemConfigButton: React.FC<IWorkflowProps> = ({ workflowId, config, disabled }) => {
  return <CreateEditButton label='System' path='/system-configuration' workflowId={workflowId} config={config} disabled={disabled} />;
};

const TestConfigButton: React.FC<IWorkflowProps> = ({ workflowId, config, disabled }) => {
  return <CreateEditButton label='Test' path='/test-configuration' workflowId={workflowId} config={config} disabled={disabled} />;
};

const ReportButton: React.FC<IReportProps> = ({ workflowId, config, disabled }) => {
  const inProgress = config && config.status === JobStatus.Running;
  const label = !config ? 'Build/Run' :
                inProgress ? 'Running' : 'View';
  return <WorkflowButton label={label} url={`/report/${workflowId}`} tooltipError={config && config.error && config.error.message} disabled={disabled} noNextStep={true} inProgress={inProgress} />;
};

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
}

export type IOverviewProps  = IStateFromProps & IDispatchFromProps;

export const Overview: React.FC<IOverviewProps> = ({
  dataRequested,
  dispatch,
  isLoading,
  workflows,
  createWorkflow,
}) => {

  // useEffect is a way for us to trigger side-effects to load systems
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
                  <TestConfigButton workflowId={w.id} config={w.testConfig} disabled={!w.systemConfig} />
                </ButtonGroup>
              </td>
              <td><ReportButton disabled={reportShouldBeDisabled(w)} workflowId={w.id} config={w.report} /></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

/**
 * NOTE: this data (below) is hard-coded sample data to help prototype the UI
 *       for fleshing out the "report" screen
 */
const DAY_MS = 1000 * 60 * 60 * 24;
const testWorkflows: IWorkflow[] = [
  // Fully complete, successful run
  {
    id: 1,
    label: 'PPAC on Chisel P2',
    createdAt: (new Date(Date.now() - 2*DAY_MS)).toISOString(),
    updatedAt: (new Date(Date.now() - 1*DAY_MS)).toISOString(),
    systemConfig: {
      id: 1,
    },
    testConfig: {
      id: 1,
    },
    report: {
      id: 1,
      status: JobStatus.Complete,
    },
  },
  // Fully set up, failed run
  {
    id: 2,
    label: 'PPAC on Bluespec P1',
    createdAt: (new Date(Date.now() - 2*DAY_MS)).toISOString(),
    updatedAt: (new Date(Date.now() - 1*DAY_MS)).toISOString(),
    systemConfig: {
      id: 2,
    },
    testConfig: {
      id: 2,
    },
    report: {
      id: 2,
      status: JobStatus.Complete,
      error: {
        id: 1,
        message: 'Error running PPAC tests',
      },
    },
  },
  // Fully set up, run in progress
  {
    id: 3,
    label: 'IEX on Chisel P1',
    createdAt: (new Date(Date.now() - 1.5*DAY_MS)).toISOString(),
    updatedAt: (new Date(Date.now() - .75*DAY_MS)).toISOString(),
    systemConfig: {
      id: 3,
    },
    testConfig: {
      id: 3,
    },
    report: {
      id: 3,
      status: JobStatus.Running,
    },
  },
  // Fully set up, ready to run
  {
    id: 4,
    label: 'BOF on Bluespec P2',
    createdAt: (new Date(Date.now() - .85*DAY_MS)).toISOString(),
    updatedAt: (new Date(Date.now() - .75*DAY_MS)).toISOString(),
    systemConfig: {
      id: 4,
    },
    testConfig: {
      id: 4,
    },
  },
  // Test set up, with error
  {
    id: 5,
    label: 'BOF on Bluespec P2',
    createdAt: (new Date(Date.now() - .75*DAY_MS)).toISOString(),
    updatedAt: (new Date(Date.now() - .55*DAY_MS)).toISOString(),
    systemConfig: {
      id: 5,
    },
    testConfig: {
      id: 5,
      error: {
        id: 2,
        message: 'Invalid vulnerability configuration',
      }
    },
  },
  // System set up, with error
  {
    id: 6,
    label: 'Resource Management on Bluespec P2',
    createdAt: (new Date(Date.now() - .6*DAY_MS)).toISOString(),
    updatedAt: (new Date(Date.now() - .5*DAY_MS)).toISOString(),
    systemConfig: {
      id: 6,
      error: {
        id: 3,
        message: 'Invalid nix configuration',
      },
    },
  },
  // Brand new,
  {
    id: 7,
    label: 'Numeric Errors on Chisel P1',
    createdAt: (new Date(Date.now())).toISOString(),
  },
]
const mapStateToProps = (state: IState): IStateFromProps => {
  const workflowsById = getWorkflowsMap(state);
  const workflowIds = getWorkflowIds(state);
  // const workflows = workflowIds.map((id) => workflowsById[id]);

  return {
    dataRequested: getDataRequested(state),
    isLoading: getIsLoading(state),
    workflows: testWorkflows,
  };
};

const mapDispatchToProps = (dispatch: Dispatch): IDispatchFromProps => ({
  dispatch,
  createWorkflow: (label: string) => dispatch(submitWorkflow(label)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export const ConnectedOverview = connector(Overview);
