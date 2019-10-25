import React, { useEffect } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux'

import {
  Container,
  Table,
} from 'react-bootstrap';

import { IState } from '../state';
import { getSystems, ISystemEntry, ISystemAction, fetchSystems } from '../state/system';
import { getIsLoading, getDataRequested } from '../state/ui';

import Header from '../components/Header';
import { LoadingIndicator } from '../components/LoadingIndicator';

import '../style/Overview.scss';

export interface IOverviewProps {
  dispatch?: Dispatch<ISystemAction>;
  systems?: ISystemEntry[];
  isLoading?: boolean;
  dataRequested?: boolean;
}

export const Overview: React.FC<IOverviewProps> = ({ dataRequested, dispatch, isLoading, systems }) => {

  useEffect(() => {
    dataRequested || (dispatch && dispatch(fetchSystems()));
  });

  return (
    <Container className='Overview'>
      <Header />
      { isLoading && <LoadingIndicator /> }
      <h1>Overview</h1>
      <Table striped bordered hover variant='light'>
            <thead>
                <tr>
                    <th>Hash</th>
                    <th>Created At</th>
                    <th>Last Updated</th>
                    <th># of Features</th>
                </tr>
            </thead>
            <tbody>
                { systems && systems.map((s, i) => (
                    <tr key={ `system-${i}`}>
                        <td>{ s.hash }</td>
                        <td>{ s.createdAt }</td>
                        <td>{ s.lastUpdate }</td>
                        <td>{ s.featureCount }</td>
                    </tr>
                )) }
            </tbody>
        </Table>
    </Container>
  );
}

const mapStateToProps = (state: IState): Partial<IOverviewProps> => {
  return {
    dataRequested: getDataRequested(state),
    isLoading: getIsLoading(state),
    systems: getSystems(state),
  };
};

export const ConnectedOverview = connect(mapStateToProps)(Overview);
