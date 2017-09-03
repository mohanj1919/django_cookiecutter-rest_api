import { connect } from 'react-redux'
import Home from '../components/Home.js'
import { PasswordExpirationCheck,
    GetCuratorProjects,
    PageChanged,
    SearchProject,
    SortChange } from '../modules/home.js'

const mapStateToProps = (state) => ({
    role: state.global.toJS().role,
    ...state.home
})
const mapDispatchToProps = {
    PasswordExpirationCheck,
    GetCuratorProjects,
    PageChanged,
    SearchProject,
    SortChange
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)