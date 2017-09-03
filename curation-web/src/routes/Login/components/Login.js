import React, { Component } from 'react';
import logo from '../../../../public/assets/images/logo.png';
import { Navbar, Nav, NavDropdown, MenuItem } from 'react-bootstrap';
import AuthOne from './_authOne';
import GoogleAuth from './_googleAuth';
import ForgotPassword from './_forgotPassword';
import ConfirmEmailSent from './_confirmEmailSent';
import { CSSTransitionGroup } from 'react-transition-group';
import Banner from '../../../components/Banner';
import Footer from '../../../components/Footer';
import './style.scss';

class Login extends Component {
  componentWillMount() {
    if (this.props.ValidateUserToken())
      this.props.router.push('/')
  }
  render() {
    return (
      <div id='header' className='header-login'>
        <Navbar className='brand-nav'>
          <Navbar.Header>
            <Navbar.Brand>
              <img src={logo} className='brand-logo' />
            </Navbar.Brand>
          </Navbar.Header>
        </Navbar>
        {this.props.banner.showBanner ? <Banner type={this.props.banner.showType} time={this.props.banner.showTime}
          message={this.props.banner.showMessage} bannerHide={this.props.HideBanner}/> : null}
        <div className="auth-container">
          <div className="container log-in-form " id='auth-one'>
            <div className="row">
              <div
                className="col-md-4 col-sm-6 col-sm-offset-3  col-md-offset-4 well log-in-well">
                <CSSTransitionGroup
                  transitionName="page"
                  transitionEnterTimeout={100}
                  transitionLeaveTimeout={100}>
                  {this.renderPage() }
                </CSSTransitionGroup>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  renderPage() {
    switch (this.props.currentPage) {
      case 'GoogleAuth':
        return (<GoogleAuth
          key={'googleAuth'}
          username={this.props.username}
          authCode={this.props.authCode}
          Authenticate={this.props.Authenticate}
          OTPLabel={this.props.OTPLabel}
          show_resend_link={this.props.show_resend_link}
          handleEvent={this.props.handleEvent}
          LogIn={this.props.LogIn} />);
      case 'ForgotPassword':
        return (<ForgotPassword
          SendForgotPasswordLink={this.props.SendForgotPasswordLink}
          username={this.props.username}
          handleEvent={this.props.handleEvent}
          key={'forgotPassword'}
          />);
      case 'ConfirmEmailSent':
        return (
          <ConfirmEmailSent key={'confirmEmailSent'} RedirectToLogin = {this.props.RedirectToLogin}/>
        );
      case 'AuthOne':
        return (<AuthOne
          key={'authone'}
          username={this.props.username}
          password={this.props.password}
          ForgotPassword={this.props.ForgotPassword}
          handleEvent={this.props.handleEvent}
          InvalidLoginMessage={this.props.InvalidLoginMessage}
          LogIn={this.props.LogIn} />);
    }
  }
}

export default Login;
