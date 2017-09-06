import React from 'react'
import { shallow, mount } from 'enzyme'
import {PasswordExpirationCheck,
    GetCuratorProjects,
    PageChanged,
    SearchProject,
    SortChange,
    default as homeReducer } from '../../../../src/routes/Home/modules/home'
import expect, { createSpy, spyOn, isSpy } from 'expect'


describe('Curator Project Actions', () => {
    let actionsCreators = {
        PasswordExpirationCheck,
        GetCuratorProjects,
        PageChanged,
        SearchProject,
        SortChange
    }
    let actions = {
        LOAD_PROJECTS : 'LOAD_PROJECTS',
        SET_PROPS : 'SET_PROPS'
    }

    it('should have an all action creators', () => {
        expect(actionsCreators).toExist
    })

    it('Testing GetCuratorProjects function', () => {
        const GCPfunc = actionsCreators.GetCuratorProjects()
        expect(GCPfunc).toBeA('function')
    })

    it('Testing PasswordExpirationCheck function', () => {
        const GCPfunc = actionsCreators.PasswordExpirationCheck()
        expect(GCPfunc).toBeA('function')
    })

    it('Testing PageChanged function', () => {
        const GCPfunc = actionsCreators.PageChanged()
        expect(GCPfunc).toBeA('function')
    })

    it('Testing SortChange function', () => {
        const GCPfunc = actionsCreators.SortChange()
        expect(GCPfunc).toBeA('function')
    })

    it('Testing SearchProject function', () => {
        const GCPfunc = actionsCreators.SearchProject()
        expect(GCPfunc).toBeA('function')
    })

})

describe('home Reducer', () => {

    const initialState = {
         projectsData: null,
    }

    it('Should be a function', () => {
        expect(homeReducer).toBeA('function');
    });

     it('should return the default state', () => {
        expect(homeReducer(undefined, {})).toEqual(initialState)
    })

})
