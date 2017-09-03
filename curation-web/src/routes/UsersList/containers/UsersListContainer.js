import { connect } from 'react-redux'
import UsersList from '../components/UsersList.js'
import { fetchUsers, toggleModal, EditUserList, toggleActive, handleEditEvent, SaveUser, DeleteUser, PageChange, SearchUser, SortChange, ResetUserPassword, toggleEmailReset, ConfirmResetUserPassword, MobileNumberChanged } from '../modules/UsersList.js';

const mapStateToProps = (state) => ({
    users: state.userslist.users,
    showModal: state.userslist.showModal,
    selectedObject: state.userslist.selectedObject,
    isDelete: state.userslist.isDelete,
    allRoles: state.userslist.allRoles,
    totalCount: state.userslist.totalCount,
    error: state.userslist.error,
    searchText: state.userslist.searchText,
    pageNumber: state.userslist.pageNumber,
    showResetModal: state.userslist.showResetModal,
    userResetEmail: state.userslist.userResetEmail,
    mfaTypes: state.userslist.mfaTypes
})

const mapDispatchToProps = {
    fetchUsers,
    toggleModal,
    EditUserList,
    handleEditEvent,
    SaveUser,
    DeleteUser,
    PageChange,
    SearchUser,
    SortChange,
    ResetUserPassword,
    ConfirmResetUserPassword,
    toggleEmailReset,
    MobileNumberChanged,
    toggleActive
}


export default connect(mapStateToProps, mapDispatchToProps)(UsersList)
