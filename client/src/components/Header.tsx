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
            <Nav.Link href='https://gitlab-ext.galois.com/ssith/tool-suite/-/blob/master/README.md' target="_blank">Documentation</Nav.Link>
            <Nav.Link href='/'>Overview</Nav.Link>
            {/*
            <Nav.Link href='/vuln-class-selector'>vuln class selector</Nav.Link>
            <Nav.Link href='/configure-cpu'>configure cpu</Nav.Link>
            <Nav.Link href='/dashboard'>reports</Nav.Link>
            */}
          </Nav>
      </Navbar>
  );
}
