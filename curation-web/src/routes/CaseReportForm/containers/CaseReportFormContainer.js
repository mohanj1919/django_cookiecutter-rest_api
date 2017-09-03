import { connect } from 'react-redux'
import CaseReportForms from '../components/CaseReportForms'
import { GetCRFs,DeleteModal,SearchCRF,OnPageChanged, SortChange } from '../modules/caseReportForm'

const mapStateToProps = (state) => ({
    CrfData: state.casereportform.crfData,
    TotalCount: state.casereportform.totalCount,
    currentPage: state.casereportform.currentPage,
    page: state.casereportform.page
})

const mapDispatchToProps = {
    GetCRFs,
    DeleteModal,
    SearchCRF,
    OnPageChanged,
    SortChange
}

export default connect(mapStateToProps, mapDispatchToProps)(CaseReportForms)