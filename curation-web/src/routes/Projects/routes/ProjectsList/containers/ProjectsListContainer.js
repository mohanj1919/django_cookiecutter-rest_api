import { connect } from 'react-redux'
import Projects from '../components/ProjectsList.js'
import { handleEvent, fetchCohorts, PageChange, SortChange, SearchCohort, EditCohortsList, DeleteCohort } from '../modules/projectslist.js';

const mapStateToProps = (state) => ({
    ...state.projectslist
})

const mapDispatchToProps = {
    handleEvent, fetchCohorts, PageChange, EditCohortsList, DeleteCohort, SearchCohort, SortChange
}


export default connect(mapStateToProps, mapDispatchToProps)(Projects)