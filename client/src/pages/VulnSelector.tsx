import React from 'react';
import { connect } from 'react-redux'

import {
    Container,
    Table,
} from 'react-bootstrap';

import { IState } from '../state';

import {
    ITestEntry,
    getEntries
} from '../state/test-results';

import { Header } from '../components/Header';

import '../style/VulnSelector.scss';

export interface IVulnSelectorProps {
    entries: ITestEntry[];
}

export const VulnSelector: React.FC<IVulnSelectorProps> = (props) => {
  return (
    <Container className='VulnSelector'>
        <Header />
        <h1>Vulnerability Class Selector</h1>
        <Table striped bordered hover variant='light'>
            BLABLA
        </Table>
    </Container>
  );
}

const mapStateToProps = (state: IState): IVulnSelectorProps => {
    return {
        entries: getEntries(state),
    };
};

export const ConnectedVulnSelector = connect(mapStateToProps)(VulnSelector);
