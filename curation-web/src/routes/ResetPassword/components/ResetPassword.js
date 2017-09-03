import React, {Component} from 'react';
import logo from '../../../../public/assets/images/logo.png';
import {Navbar, Nav, NavDropdown, MenuItem} from 'react-bootstrap'
import {CSSTransitionGroup} from 'react-transition-group'
import PasswordResetForm from './_passwordResetForm'
import ScanGoogleAuth from './_scanGoogleAuth'
import './style.scss'

export default class ResetPassword extends Component {
  componentWillMount(){
      this.props.SetUUID(this.props.routeParams.uuid);
    if(this.props.GetUserId()){
        this.props.router.push('/')
    }
  }
    render() {
        return (
            <div id='header' className='header-login'>
                <Navbar className='brand-nav'>
                    <Navbar.Header>
                        <Navbar.Brand>
                            <img src={logo} className='brand-logo'/>
                        </Navbar.Brand>
                    </Navbar.Header>
                </Navbar>
                <div className="auth-container">
                    <div className="container log-in-form " id='auth-one'>
                        <div className="row">
                            <div className="col-md-4 col-sm-6 col-sm-offset-3  col-md-offset-4 well log-in-well">
                                <CSSTransitionGroup
                                    transitionName="page"
                                    transitionEnterTimeout={100}
                                    transitionLeaveTimeout={100}>
                                    {this.renderPage()}
                                </CSSTransitionGroup>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderPage() {
        switch (this.props.currentPage) {
            case 'PasswordResetForm':
                return (<PasswordResetForm
                    key={'passwordresetform'}
                    password = {this.props.password}
                    confirmPassword = {this.props.confirmPassword}
                    handleEvent = {this.props.handleEvent}   
                    error = {this.props.error}
                    passwordValidations = {this.props.passwordValidations}
                    showError = {this.props.showError}
                    passwordValidationState = {this.props.passwordValidationState}           
                    ResetPasswordSuccess = {this.props.ResetPasswordSuccess} />);
            default:
                return (<ScanGoogleAuth
                    key={'scangoogleauth'}
                    clientProvisioningURI = {this.props.mfaurl}
                    RedirectToLogin={this.props.RedirectToLogin}
                     />);
        }
    }
}
