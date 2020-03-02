import React from 'react';

import {
    Button,
    OverlayTrigger,
    Popover,
    PopoverProps,
    Spinner,
} from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

import { IConfig, IReportConfig, JobStatus } from '../state/workflow';

export interface IWorkflowProps {
    workflowId?: number;
    config?: IConfig;
    disabled?: boolean;
}

interface IErrorTooltipProps extends PopoverProps {
    label: string;
}

interface IWorkflowButtonProps {
    url: string;
    label: string;
    variant?: 'success' | 'warning' | 'danger';
    disabled?: boolean;
    noNextStep?: boolean;
    tooltipError?: string;
    inProgress?: boolean;
    onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const WorkflowButton: React.FC<IWorkflowButtonProps> = ({
  url,
  label,
  variant,
  disabled,
  noNextStep,
  tooltipError,
  inProgress,
  onClick
}) => {
    const renderTooltip: React.FC<IErrorTooltipProps> = (props) => (<Popover {...props} content={true}>{props.label}</Popover>);
    const variantType = inProgress ? 'warning' :
                          disabled ? 'secondary' :
                           variant ? variant : 'primary';
  
    return tooltipError ?
      <OverlayTrigger placement='bottom' overlay={(props: IErrorTooltipProps) => renderTooltip({ ...props, label: tooltipError })}>
        <Button disabled={disabled} variant='danger' href={url}>{label}</Button>
      </OverlayTrigger>
      : (
        <Button disabled={disabled} variant={variantType} href={url} {...(onClick ? { onClick } : null)}>
          { inProgress && <Spinner as='span' animation='grow' size='sm' role='status' aria-hidden='true' /> }
          { label }
          { !(disabled || noNextStep) && variantType !== 'primary' && <FontAwesomeIcon icon={faChevronRight} /> }
        </Button>
      );
};

interface ICreateEditButtonProps extends IWorkflowProps {
    label: string;
    path: string;
    config?: IConfig;
    disabled?: boolean;
    inProgress?: boolean;
    noNextStep?: boolean;
    workflowId?: number;
}

export const CreateEditButton: React.FC<ICreateEditButtonProps> = ({
    workflowId,
    config,
    path,
    disabled,
    label,
    noNextStep,
    inProgress
}) => {
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

export const SystemConfigButton: React.FC<IWorkflowProps> = ({ workflowId, config, disabled }) => {
  return <CreateEditButton label='System' path='/system-configuration' workflowId={workflowId} config={config} disabled={disabled} />;
};

export const TestConfigButton: React.FC<IWorkflowProps> = ({ workflowId, config, disabled }) => {
  return <CreateEditButton label='Test' path='/test-configuration' workflowId={workflowId} config={config} disabled={disabled} />;
};

interface IReportButtonProps {
  workflowId: number;
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  config?: IReportConfig;
  disabled?: boolean;
}

export const ReportButton: React.FC<IReportButtonProps> = ({ workflowId, onClick, config, disabled }) => {
  const inProgress = config && config.status === JobStatus.Running;
  const label = !config ? 'Build/Run' :
                inProgress ? 'Running' : 'View';
  return <WorkflowButton
          label={label}
          url={`/report/${workflowId}`}
          tooltipError={config && config.error && config.error.message}
          disabled={disabled}
          noNextStep={true}
          inProgress={inProgress}
          onClick={onClick} />;
};
