import { connect } from 'react-redux'
import ResetPassword from '../components/ResetPassword.js'
import { ResetPasswordSuccess, GetUserId, RedirectToLogin, SetUUID, handleEvent } from '../modules/resetpassword.js'

const mapStateToProps = (state) => ({
    currentPage: state.resetpassword.currentPage,
    error: state.resetpassword.error,
    passwordValidationState: state.resetpassword.passwordValidationState,
    showError: state.resetpassword.showError,
    mfaurl: state.resetpassword.mfaurl,
    passwordValidations: state.resetpassword.passwordValidations
})
const mapDispatchToProps =  {
    ResetPasswordSuccess, GetUserId, RedirectToLogin, SetUUID, handleEvent
}

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword)