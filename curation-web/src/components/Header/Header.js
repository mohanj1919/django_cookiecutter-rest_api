import React, {Component} from 'react'
import '../../../scss/style.scss'
import {Navbar, Nav, NavItem, NavDropdown, MenuItem, Button} from 'react-bootstrap'
import logo from '../../../public/assets/images/logo.png';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router'

class Header extends Component {
  NavigateToLogin() {
    if (window.location.href.indexOf('login') == -1) {
      this.props.router.push('/pageNotFound');
    }
  }
  componentWillUpdate() {
    if (document.getElementsByClassName('project-configure') && document.getElementsByClassName('project-configure')[0]) {
      if (window.location.href.indexOf('projects/configure') > -1) {
        document.getElementsByClassName('project-configure')[0].className += ' active'
      } else {
        document.getElementsByClassName('project-configure')[0].className = 'project-configure'
      }
    }
  }
  render() {
    return (
      <div id='header'>
        <Navbar className='brand-nav'>
          <Navbar.Header>
            <Navbar.Brand>
              <img src={logo} className='brand-logo' onClick={() => window.location.href = '/'}/>
            </Navbar.Brand>
          </Navbar.Header>
          <Nav pullRight>
            <NavDropdown
              title={this.props && this.props.userFirstName ? 'Hi, ' + this.props.userFirstName : 'Undefined user'}
              id='basic-nav-dropdown'
              className='user-dropdown'>
              <MenuItem>{this.props.userEmail}</MenuItem>
              <MenuItem divider/>
              <MenuItem onClick={() => { this.props.router.push('/users/profile') } }>Edit Profile</MenuItem>
              <MenuItem onClick={() => { this.props.logOut() } }>Logout</MenuItem>
            </NavDropdown>
          </Nav>
        </Navbar>

        {localStorage.getItem('logged_user_role') == 'admin' ?
          <Navbar className='admin-actions'>
            <Nav>
              <LinkContainer to="/" className="cohorts-list">
                <NavItem><i className='fa fa-home'></i></NavItem>
              </LinkContainer>
              <LinkContainer to="/projects/configure" className="project-configure">
                <NavItem>Configure Project</NavItem>
              </LinkContainer>
              <LinkContainer to="/userslist" id="nav-userslist" className="users-list">
                <NavItem>Manage Users</NavItem>
              </LinkContainer>
              <LinkContainer to="/casereportform" className="case-report-form">
                <NavItem>Build CRF</NavItem>
              </LinkContainer>
              <LinkContainer to="/questions" className="questions-list">
                <NavItem>Questions</NavItem>
              </LinkContainer>
              <LinkContainer to="/search" className="extract-crf">
                <NavItem>Extract CRF</NavItem>
              </LinkContainer>
            </Nav>
            <Nav pullRight>
              <NavDropdown title={<i className="fa fa-cog" aria-hidden="true"></i>}  id="nav-dropdown">
                <MenuItem onClick={() => { this.props.router.push("/settings") } }>Settings</MenuItem>
                <MenuItem onClick={() => { this.props.router.push("/emailtemplatedesigner") } }>Design Email Template</MenuItem>
              </NavDropdown>
            </Nav>
          </Navbar> :
          localStorage.getItem('logged_user_role') == 'curator' ?
            <Navbar className='admin-actions curator-actions'>
              <Nav>
                <LinkContainer to="/" className="cohorts-list">
                  <NavItem><i className='fa fa-home'></i></NavItem>
                </LinkContainer>
                <LinkContainer to="/search" className="extract-crf">
                <NavItem>Search</NavItem>
              </LinkContainer>
              </Nav>
            </Navbar>
            : this.NavigateToLogin()
        }
      </div>
    )
  }
}

export default Header;
