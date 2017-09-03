import React from 'react';
import { connect } from 'react-redux';
import Authentication from '../components/Authentication';
import { withRouter } from 'react-router';
import { Logout, ValidateUserToken, HideBanner } from '../modules/global.js'

const mapStateToProps = (state) => ({
    authenticated: state.global.toJS().isAuthenticated,
    userEmail: state.global.toJS().emailid,
    userFirstName: state.global.toJS().userFirstName,
    showType:state.global.toJS().showType,
    showTime:state.global.toJS().showTime,
    showMessage:state.global.toJS().showMessage,
    showBanner:state.global.toJS().showBanner,
    successCb:state.global.toJS().successCb,
    messageTitle:state.global.toJS().messageTitle,
    role:state.global.toJS().role,
    isloading:state.global.toJS().isLoading,
    confirmText:state.global.toJS().confirmText
});
const mapDispatchToProps =  {
   Logout, ValidateUserToken, HideBanner
}
export default function (ComposedComponent, Roles) {
  return connect(mapStateToProps, mapDispatchToProps)(withRouter(Authentication(ComposedComponent, Roles)));
}
