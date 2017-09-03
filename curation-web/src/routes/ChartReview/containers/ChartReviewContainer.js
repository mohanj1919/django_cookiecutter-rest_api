import { connect } from 'react-redux'
import ChartReview from '../components/ChartReview.js'
import { SelectTemplate,
    ClearData,
    TogglingCollapse,
    GetPatientDetailsById,
    GetPatientsIDList,
    SetCohortID,
    handleEditEvent,
    handleAnswerEvent,
    CompleteCuration,
    SubmitTemplate,
    ToggleAnnotation,
    optionsChanged,
    addChild,
    removeChild } from '../modules/ChartReview.js';

export const mapStateToProps = (state) => ({
    ...state.chartreview
})

const mapDispatchToProps = {
    GetPatientDetailsById,
    GetPatientsIDList,
    SetCohortID,
    handleEditEvent,
    handleAnswerEvent,
    SubmitTemplate,
    SelectTemplate,
    CompleteCuration,
    TogglingCollapse,
    ClearData,
    ToggleAnnotation,
    optionsChanged,
    addChild,
    removeChild
}


export default connect(mapStateToProps, mapDispatchToProps)(ChartReview)
