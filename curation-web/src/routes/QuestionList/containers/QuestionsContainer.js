import { connect } from 'react-redux'
import Questions from '../components/Questions'
import {LoadQuestionsData,
    PageChanged,
    SizePerPageListChange,
    SearchQuestion,
    toggleModal,
    handleEditEvent,
    OptionAdded,
    RemoveOption,
    SaveQuestion,
    SortChange } from '../modules/questions.js'

const mapStateToProps = (state) => ({
    ...state.question
})

const mapDispatchToProps = {
    LoadQuestionsData,
    SizePerPageListChange,
    PageChanged,
    SearchQuestion,
    toggleModal,
    handleEditEvent,
    OptionAdded,
    RemoveOption,
    SaveQuestion,
    SortChange
}

export default connect(mapStateToProps, mapDispatchToProps)(Questions)