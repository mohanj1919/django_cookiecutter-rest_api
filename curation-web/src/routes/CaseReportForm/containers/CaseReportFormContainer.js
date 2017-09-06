import { connect } from 'react-redux'
import CaseReportForms from '../components/CaseReportForms'
import { GetCRFs, DeleteModal, SearchCRF, OnPageChanged, SortChange, ClearData } from '../modules/caseReportForm'

const mapStateToProps = (state) => ({
    CrfData: state.casereportform.crfData,
    TotalCount: state.casereportform.totalCount,
    currentPage: state.casereportform.currentPage,
    page: state.casereportform.page,
    searchParam: state.casereportform.searchParam
})

const mapDispatchToProps = {
    GetCRFs,
    DeleteModal,
    SearchCRF,
    ClearData,
    OnPageChanged,
    SortChange
}

export default connect(mapStateToProps, mapDispatchToProps)(CaseReportForms)