import React from 'react';

import {
    Nav,
    Navbar,
} from 'react-bootstrap';

import '../style/Header.scss';

export const Header: React.FC = () => {
  return (
      <Navbar className='Header' variant='dark'>
          <Navbar.Brand className='logo'>BESSPIN</Navbar.Brand>
          <Nav>
            <Nav.Link href='/'>overview</Nav.Link>
            <Nav.Link href='/configure-cpu'>system configurator</Nav.Link>
            <Nav.Link href='/dashboard'>reports</Nav.Link>
          </Nav>
      </Navbar>
  );
}
