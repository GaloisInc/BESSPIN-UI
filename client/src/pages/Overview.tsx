import React from 'react';
import { connect } from 'react-redux'

import {
  Container,
  Table,
} from 'react-bootstrap';

import { IState } from '../state';
import { getSystems, ISystemEntry } from '../state/system';

import Header from '../components/Header';

import '../style/Overview.scss';

export interface IOverviewProps {
  systems: ISystemEntry[];
}

export const Overview: React.FC<IOverviewProps> = (props) => {
  return (
    <Container className='Overview'>
      <Header />
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
                { props.systems.map(s => (
                    <tr>
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

const mapStateToProps = (state: IState): IOverviewProps => {
  return {
      systems: getSystems(state),
  };
};

export const ConnectedOverview = connect(mapStateToProps)(Overview);
