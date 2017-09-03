import { connect } from 'react-redux'
import ProjectsConfigure from '../components/ProjectsConfigure.js'
import { dispatchToProps } from '../modules/projectsconfigure.js';

const mapStateToProps = (state) => ({
    ...state.projectsconfigure
})

const mapDispatchToProps = {
    ...dispatchToProps()
}


export default connect(mapStateToProps, mapDispatchToProps)(ProjectsConfigure)