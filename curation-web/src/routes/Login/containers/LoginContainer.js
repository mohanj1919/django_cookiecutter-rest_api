import { connect } from 'react-redux'
import Login from '../components/Login.js'
import { handleEvent, LogIn, Authenticate, SendForgotPasswordLink, ForgotPassword, HideBanner, RedirectToLogin } from '../modules/login.js'
import { ValidateUserToken } from '../../../modules/global.js'
export const mapStateToProps = (state) => ({
    username: state.Login.username,
    password: state.Login.password,
    authCode: state.Login.authCode,
    isAuthenticated: state.global.toJS().isAuthenticated,
    currentPage: state.Login.currentPage,
    banner: state.Login.banner,
    OTPLabel: state.Login.OTPLabel,
    show_resend_link: state.Login.show_resend_link,
    InvalidLoginMessage: state.Login.InvalidLoginMessage
})

export const mapDispatchToProps = {
    LogIn, handleEvent, Authenticate, ValidateUserToken, SendForgotPasswordLink, ForgotPassword, HideBanner, RedirectToLogin
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)