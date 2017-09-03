import { connect } from 'react-redux'
import AdminSettings from '../components/AdminSettings.js'
import { GetAdminSettings,
    HandleTextEdit,
    SubmitSettings,
    CancelEditing } from '../modules/adminSettings.js';

const mapStateToProps = (state) => ({
    ...state.adminsettings
})

const mapDispatchToProps = {
    GetAdminSettings,
    HandleTextEdit,
    SubmitSettings,
    CancelEditing
}


export default connect(mapStateToProps, mapDispatchToProps)(AdminSettings)