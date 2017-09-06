import React from 'react'
import { shallow, mount } from 'enzyme'
import {fetchUsers,
        SaveUser,
        DeleteUser,
        SortChange,
        PageChange,
        SearchUser,
        MobileNumberChanged,
        handleEditEvent,
        EditUserList,
        ResetUserPassword,
        ConfirmResetUserPassword,
        toggleEmailReset,
        toggleActive,
        toggleModal,
        default as loginReducer } from '../../../../src/routes/UsersList/modules/UsersList'
import expect, { createSpy, spyOn, isSpy } from 'expect'

describe('UserList Actions', () => {
    let actionsCreators = {
        fetchUsers,
        SaveUser,
        DeleteUser,
        SortChange,
        PageChange,
        SearchUser,
        MobileNumberChanged,
        handleEditEvent,
        EditUserList,
        ResetUserPassword,
        ConfirmResetUserPassword,
        toggleEmailReset,
        toggleActive,
        toggleModal,

    }

    let actions = {
        FETCH_USER : 'FETCH_USER',
        TOGGLE_MODAL : 'TOGGLE_MODAL',
        EDIT_USER : 'EDIT_USER',
        USER_INPUT_CHANGE : 'USER_INPUT_CHANGE',
        SAVE_USER : 'SAVE_USER',
        SET_PROP : 'SET_PROP',
        SET_ERRORS : 'SET_ERRORS',
    }

    it('should have an all action creators', () => {
        expect(actionsCreators).toExist
    })

    it('Testing fetchUsers function', () => {
        const FUfunc = actionsCreators.fetchUsers()
        expect(FUfunc).toBeA('function')
    })

    it('Testing SaveUser function', () => {
        const SvUfunc = actionsCreators.SaveUser()
        expect(SvUfunc).toBeA('function')
    })

    it('Testing DeleteUser function', () => {
        const DSfunc = actionsCreators.DeleteUser()
        expect(DSfunc).toBeA('function')
    })

    it('Testing SortChange function', () => {
        const SCfunc = actionsCreators.SortChange()
        expect(SCfunc).toBeA('function')
    })

    it('Testing PageChange function', () => {
        const PCfunc = actionsCreators.PageChange()
        expect(PCfunc).toBeA('function')
    })

    it('Testing SearchUser function', () => {
        const SUfunc = actionsCreators.SearchUser()
        expect(SUfunc).toBeA('function')
    })

    it('Testing MobileNumberChanged function', () => {
        const MNCfunc = actionsCreators.MobileNumberChanged()
        expect(MNCfunc).toBeA('function')
    })

    it('Testing handleEditEvent function', () => {
        const HEEfunc = actionsCreators.handleEditEvent()
        expect(HEEfunc).toBeA('function')
    })

    it('Testing EditUserList function', () => {
        const EULfunc = actionsCreators.EditUserList()
        expect(EULfunc).toBeA('function')
    })

    it('Testing ResetUserPassword function', () => {
        const RUPfunc = actionsCreators.ResetUserPassword()
        expect(RUPfunc).toBeA('function')
    })

    it('Testing ConfirmResetUserPassword function', () => {
        const CRUPfunc = actionsCreators.ConfirmResetUserPassword()
        expect(CRUPfunc).toBeA('function')
    })

    it('Testing toggleEmailReset function', () => {
        const TERfunc = actionsCreators.toggleEmailReset()
        expect(TERfunc).toBeA('function')
    })

    it('Testing toggleActive function', () => {
        const TAfunc = actionsCreators.toggleActive()
        expect(TAfunc).toBeA('function')
    })

    it('Testing toggleModal function', () => {
        const TMfunc = actionsCreators.toggleModal()
        expect(TMfunc).toBeA('function')
    })

})

describe('login Reducer', () => {

    const initialState = {
        users: [],
        showModal: false,
        selectedObject: { id: null },
        isDelete: false,
        newUser: null,
        allRoles: [],
        error: null,
        pageSize: 10,
        pageNumber: 1,
        Page: 1,
        searchTerm: null,
        sortName: null,
        sortOrder: null
    }

    it('Should be a function', () => {
        expect(loginReducer).toBeA('function');
    });

     it('should return the default state', () => {
        expect(loginReducer(undefined, {})).toEqual(initialState)
    })

})