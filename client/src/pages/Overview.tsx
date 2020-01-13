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
} from 'react-bootstrap';

import { IState } from '../state';

import {
  ISystemAction,
  fetchSystems,
} from '../state/system';

import {
  getIsLoading,
  getDataRequested,
} from '../state/ui';

import { Header } from '../components/Header';
import { LoadingIndicator } from '../components/LoadingIndicator';

import '../style/Overview.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'

const TWO_DAYS_IN_MS = 1000 * 60 * 60 * 24 * 2;
const TEST_WORKFLOWS: IWorkflow[] = [
  {
    id: 1,
    label: 'Completed Workflow',
    createdAt: (new Date(Date.now() - TWO_DAYS_IN_MS)).toISOString(),
    updatedAt: (new Date(Date.now() - .5 * TWO_DAYS_IN_MS)).toISOString(),
    systemConfig: { id: 2 },
    testConfig: { id: 2 },
    report: { id: 2 },
  },
  {
    id: 2,
    label: 'Failed build workflow',
    createdAt: (new Date(Date.now() - 2 * TWO_DAYS_IN_MS)).toISOString(),
    updatedAt: (new Date(Date.now() - 1.5 * TWO_DAYS_IN_MS)).toISOString(),
    hasError: true,
    systemConfig: {
      id: 1,
    },
    testConfig: {
      id: 1,
    },
    report: {
      id: 1,
      error: {
        id: 1,
        message: 'Something went wrong building the system',
      },
    }
  },
  {
    id: 3,
    label: 'Failed test config workflow',
    createdAt: (new Date(Date.now() - 2 * TWO_DAYS_IN_MS)).toISOString(),
    updatedAt: (new Date(Date.now() - 1.5 * TWO_DAYS_IN_MS)).toISOString(),
    hasError: true,
    systemConfig: { id: 1 },
    testConfig: {
      id: 1,
      error: {
        id: 1,
        message: 'Something went wrong configuring the tests',
      },
    },
  },
  {
    id: 4,
    label: 'Missing Test Config Workflow',
    createdAt: (new Date(Date.now() - TWO_DAYS_IN_MS)).toISOString(),
    updatedAt: (new Date(Date.now() - .25 * TWO_DAYS_IN_MS)).toISOString(),
    systemConfig: { id: 1 },
  },
  {
    id: 5,
    label: 'New Workflow',
    createdAt: (new Date(Date.now())).toISOString(),
  },
];

// NOTE: We currently are defining our workflow data-types here so
//       we can easily iterate on the UX.
//       Once we have settled on the UX, we need to create a new
//       "workflow" state definition and move these to that definition.
export interface IWorkflowError {
  id: number;
  message: string;
}

export interface IConfig {
  id: number;
  error?: IWorkflowError;
}

export interface IWorkflow {
  id: number;
  label: string;
  createdAt: string;
  hasError?: boolean;
  updatedAt?: string;
  systemConfig?: IConfig;
  testConfig?: IConfig;
  report?: IConfig;
}

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

interface IViewCreateButtonProps extends IWorkflowProps {
  label: string;
  path: string;
  noNextStep?: boolean;
}

interface IWorkflowButton {
  url: string;
  label: string;
  variant?: 'success' | 'danger';
  disabled?: boolean;
  noNextStep?: boolean;
  tooltipError?: string;
}

interface IErrorTooltipProps extends PopoverProps {
  label: string;
}

const WorkflowButton: React.FC<IWorkflowButton> = ({ url, label, variant, disabled, noNextStep, tooltipError }) => {
  const renderTooltip: React.FC<IErrorTooltipProps> = (props) => (<Popover {...props} content={true}>{props.label}</Popover>);
  const variantType = (disabled ? 'secondary' : variant) || 'primary';

  return tooltipError ?
    <OverlayTrigger placement='bottom' overlay={(props: IErrorTooltipProps) => renderTooltip({ ...props, label: tooltipError })}>
      <Button disabled={disabled} variant='danger' href={url}>{label}</Button>
    </OverlayTrigger>
    : (
      <Button disabled={disabled} variant={variantType} href={url}>
        {label}
        {!(disabled || noNextStep ) && variantType !== 'primary' && <FontAwesomeIcon icon={faChevronRight} />
        }</Button>
    );
};

const ViewCreateButton: React.FC<IViewCreateButtonProps> = ({ workflowId, config, path, disabled, label, noNextStep }) => {
  if (config) {
    return <WorkflowButton
      disabled={disabled}
      label={label}
      noNextStep={noNextStep}
      tooltipError={config.error && config.error.message}
      url={`${path}/view/${config.id}`}
      variant='success'
    />;
  } else {
    return <WorkflowButton label={label} url={`${path}/create/${workflowId}`} disabled={disabled} noNextStep={noNextStep} />;
  }
};

const SystemConfigButton: React.FC<IWorkflowProps> = ({ workflowId, config, disabled }) => {
  return <ViewCreateButton label='System' path='/system-configuration' workflowId={workflowId} config={config} disabled={disabled} />;
};

const TestConfigButton: React.FC<IWorkflowProps> = ({ workflowId, config, disabled }) => {
  return <ViewCreateButton label='Test' path='/test-configuration' workflowId={workflowId} config={config} disabled={disabled} />;
};

const ReportButton: React.FC<IWorkflowProps> = ({ workflowId, config, disabled }) => {
  const label = config && !config.error ? 'View' : 'Build/Run';
  return <ViewCreateButton label={label} path='/report' workflowId={workflowId} config={config} disabled={disabled} noNextStep={true} />;
};

const reportShouldBeDisabled = (workflow: IWorkflow): boolean => {
  if (!workflow.systemConfig) return true;
  if (workflow.systemConfig.error) return true;
  if (workflow.systemConfig && !workflow.testConfig) return true;
  if (workflow.testConfig && workflow.testConfig.error) return true;

  return false;
};

export interface IOverviewProps {
  dispatch?: Dispatch<ISystemAction>;
  workflows: IWorkflow[];
  isLoading: boolean;
  dataRequested: boolean;
  createNewWorkflow: (_: string) => void;
}

// TODO: this is a placeholder implementation to allow us to 
//       iterate on the UX before plumbing in the actual state
const tmpWorkFlowFn = (label: string) => {
  console.log(`create new workflow labeled "${label}"`);
};

export const Overview: React.FC<IOverviewProps> = ({
  dataRequested,
  dispatch,
  isLoading,
  workflows,
  createNewWorkflow = tmpWorkFlowFn
}) => {

  // useEffect is a way for us to trigger side-effects to load systems
  useEffect(() => {
    dataRequested || (dispatch && dispatch(fetchSystems()));
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
          <Button className='create-new-workflow' variant='primary' onClick={() => createNewWorkflow(newWorkflow)}>Create</Button>
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

const mapStateToProps = (state: IState): IOverviewProps => {
  return {
    dataRequested: getDataRequested(state),
    isLoading: getIsLoading(state),
    workflows: TEST_WORKFLOWS, // PLACEHOLDER...
    createNewWorkflow: (_: string) => { }, // PLACEHOLDER...
  };
};

export const ConnectedOverview = connect(mapStateToProps)(Overview);
