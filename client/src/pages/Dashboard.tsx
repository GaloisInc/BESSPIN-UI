import React from 'react';
import { connect } from 'react-redux'

import {
    Container,
    Table,
} from 'react-bootstrap';

import { IState } from '../state';
import { ITestEntry, getEntries } from '../state/test-results';

import Header from '../components/Header';

import '../style/Dashboard.scss';

export interface IDashboardProps {
    entries: ITestEntry[];
}

export const Dashboard: React.FC<IDashboardProps> = (props) => {
  return (
    <Container className='Dashboard'>
        <Header />
        <h1>Dashboard</h1>
        <Table striped bordered hover variant='light'>
            <thead>
                <tr>
                    <th>Hash</th>
                    <th>CPU</th>
                    <th>Result</th>
                </tr>
            </thead>
            <tbody>
                { props.entries.map((e, i) => (
                    <tr key={ `dash-row-${i}`}>
                        <td>{ e.hash }</td>
                        <td>{ e.cpu }</td>
                        <td>{ e.result }</td>
                    </tr>
                )) }
            </tbody>
        </Table>
    </Container>
  );
}

const mapStateToProps = (state: IState): IDashboardProps => {
    return {
        entries: getEntries(state),
    };
};

export const ConnectedDashboard = connect(mapStateToProps)(Dashboard);
