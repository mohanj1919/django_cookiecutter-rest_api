import { connect } from 'react-redux'
import ShowPatients from '../components/ShowPatients'
import { dispatchToProps } from '../modules/showpatients'

const mapStateToProps = (state) => ({
    ...state.showpatients
})

const mapDispatchToProps = {
   ...dispatchToProps()
}

export default connect(mapStateToProps, mapDispatchToProps)(ShowPatients)