import React from 'react';

import { LinkContainer } from 'react-router-bootstrap'

import {
    Nav,
    Navbar,
} from 'react-bootstrap';

import '../style/Header.scss';

const Header: React.FC = () => {
  return (
      <Navbar className='Header' variant='dark'>
          <Navbar.Brand className='logo'>BESSPIN</Navbar.Brand>
          <Nav>
            <LinkContainer to='/'>
                <Nav.Link>overview</Nav.Link>
            </LinkContainer>
            <LinkContainer to='/configure-cpu'>
                <Nav.Link>configure cpu</Nav.Link>
            </LinkContainer>
            <LinkContainer to='/dashboard'>
                <Nav.Link>dashboard</Nav.Link>
            </LinkContainer>
          </Nav>
      </Navbar>
  );
}

export default Header;
