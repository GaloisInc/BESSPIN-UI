import React from 'react';

import {
    Nav,
    Navbar,
    NavDropdown,
} from 'react-bootstrap';

import '../style/Header.scss';

export const Header: React.FC = () => {
  return (
      <Navbar className='Header' variant='dark'>
          <Navbar.Brand className='logo'>BESSPIN</Navbar.Brand>
          <Nav>
            <NavDropdown
              id="collapsible-nav-dropdown"
              title="Documentation"
              href='https://gitlab-ext.galois.com/ssith/tool-suite/-/blob/master/README.md'
              target="_blank"
            >
              <NavDropdown.Item
                href='https://gitlab-ext.galois.com/ssith/tool-suite/-/blob/master/README.md'
                target="_blank">
                Tool-suite
              </NavDropdown.Item>
              <NavDropdown.Item
                href='https://gitlab-ext.galois.com/ssith/testgen/-/blob/master/README.md'
                target="_blank">
                Testgen
              </NavDropdown.Item>
              <NavDropdown.Item
                href='https://gitlab-ext.galois.com/ssith/arch-extract/-/blob/master/README.md'
                target="_blank">
                Arch-extract
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link href='/arch-extract'>ArchExtract</Nav.Link>
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
