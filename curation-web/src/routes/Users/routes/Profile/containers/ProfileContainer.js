import { connect } from 'react-redux'
import Profile from '../components/Profile.js'
import {handleEvent, GetUserDetails, submitFormFunction, CancelUpdate} from '../modules/profile.js';

const mapStateToProps = (state) => ({
    ...state.profile
})

const mapDispatchToProps = {
    handleEvent, GetUserDetails, submitFormFunction, CancelUpdate
}


export default connect(mapStateToProps, mapDispatchToProps)(Profile)