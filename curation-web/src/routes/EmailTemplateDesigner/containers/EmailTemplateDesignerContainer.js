import { connect } from 'react-redux'
import EmailTemplateDesigner from '../components/EmailTemplateDesigner.js'
import { TextEdited,
    DefaultTextSelected,
    GetTemplateDetails,
    SubjectChanged,
    SaveTemplateDetails,
    TemplateSelected,
    CancelTemplateDetails,
    SetCurrentInstance } from '../modules/emailTemplateDesigner.js';

export const mapStateToProps = (state) => ({
    ...state.emailtemplatedesigner
})

const mapDispatchToProps = {
    TextEdited,
    DefaultTextSelected,
    GetTemplateDetails,
    SubjectChanged,
    SaveTemplateDetails,
    TemplateSelected,
    CancelTemplateDetails,
    SetCurrentInstance
}


export default connect(mapStateToProps, mapDispatchToProps)(EmailTemplateDesigner)
