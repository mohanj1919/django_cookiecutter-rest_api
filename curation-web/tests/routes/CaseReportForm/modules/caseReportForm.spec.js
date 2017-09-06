import React from 'react'
import { shallow, mount } from 'enzyme'
import expect, { createSpy, spyOn, isSpy } from 'expect'
import {GetCRFs,
    OnPageChanged,
    SortChange,
    DeleteModal,
    SearchCRF,
    default as caseReportFormsReducer} from '../../../../src/routes/CaseReportForm/modules/caseReportForm'

describe('CaseReportForm Actions', () => {

    let actionsCreators = {
        GetCRFs,
        OnPageChanged,
        SortChange,
        DeleteModal,
        SearchCRF,
    }

    let actions = {
        CRFS_LIST: 'CRFS_LIST',
        DELETE_MODAL_TOGGLE: 'DELETE_MODAL_TOGGLE',
        DELETE_CONFIRMATION: 'DELETE_CONFIRMATION',
        SEARCH_CRF: 'SEARCH_CRF',
        SET_PROPS: 'SET_PROPS',
    }

    it('should have an all action creators', () => {
        expect(actionsCreators).toExist
    })

    it('Testing GetCRFs function', () => {
        const LQDfunc = actionsCreators.GetCRFs()
        expect(LQDfunc).toBeA('function')
    })

    it('Testing OnPageChanged function', () => {
        const LQDfunc = actionsCreators.OnPageChanged()
        expect(LQDfunc).toBeA('function')
    })

    it('Testing SortChange function', () => {
        const LQDfunc = actionsCreators.SortChange()
        expect(LQDfunc).toBeA('function')
    })

    it('Testing DeleteModal function', () => {
        const LQDfunc = actionsCreators.DeleteModal()
        expect(LQDfunc).toBeA('function')
    })

    it('Testing SearchCRF function', () => {
        const LQDfunc = actionsCreators.SearchCRF()
        expect(LQDfunc).toBeA('function')
    })

})

describe('case report form Reducer', () => {

    const initialState = {
        crfData: null,
        deleteModal: null,
        showDeleteModal: false,
        deletableCrfId: null,
        searchParam: ''
    }

    it('Should be a function', () => {
        expect(caseReportFormsReducer).toBeA('function');
    });

    it('should return the default state', () => {
        expect(caseReportFormsReducer(undefined, {})).toEqual(initialState)
    })

})