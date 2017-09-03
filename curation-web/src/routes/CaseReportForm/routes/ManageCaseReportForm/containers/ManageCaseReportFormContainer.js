import { connect } from 'react-redux'
import ManageCaseReportForm from '../components/ManageCaseReportForm'
import { OnFileUpload,
    UploadClick,
    RemoveFile,
    HandleTextEdit,
    CellEdit,
    AddModal,
    AddResponses,
    RemoveResponse,
    AddQuestion,
    DeleteModal,
    ClearState,
    GetCRFDetails,
    SaveCRFTemplate,
    ValidateCellLength,
    SearchQuestion,
    GetQuestionsList,
    LoadQuestion,
    CancelModal } from '../modules/manageCaseReportForm'

const mapStateToProps = (state) => ({
    ...state.managecasereportform
})

const mapDispatchToProps = {
    OnFileUpload,
    UploadClick,
    RemoveFile,
    HandleTextEdit,
    CellEdit,
    AddModal,
    DeleteModal,
    AddResponses,
    RemoveResponse,
    AddQuestion,
    ClearState,
    GetCRFDetails,
    SaveCRFTemplate,
    ValidateCellLength,
    SearchQuestion,
    GetQuestionsList,
    CancelModal,
    LoadQuestion
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageCaseReportForm)