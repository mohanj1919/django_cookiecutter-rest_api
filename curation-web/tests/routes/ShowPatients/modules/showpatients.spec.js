import React from 'react'
import { shallow, mount } from 'enzyme'
import expect, { createSpy, spyOn, isSpy } from 'expect'
import {
        GetCohorts,
        GetProjects,
        default as showPatientsReducer } from '../../../../src/routes/SearchPatient/routes/ShowPatients/modules/showpatients'

describe('Show Patients Actions', () => {

     let actionsCreators = {
        GetCohorts,
        GetProjects,
     }

     let actions = {
        SET_PROP : 'SET_PROP'
     }

     it('should have an all action creators', () => {
        expect(actionsCreators).toExist
     })

     it('Testing GetCohorts function', () => {
        const GCfunc = actionsCreators.GetCohorts()
        expect(GCfunc).toBeA('function')
     })

     it('Testing GetProjects function', () => {
        const GPfunc = actionsCreators.GetProjects()
        expect(GPfunc).toBeA('function')
     })

})

describe('showPatients Reducer', () => {

    const initialState = {
        pageNumber: 1,
        searchParams: {}
    }

    it('Should be a function', () => {
        expect(showPatientsReducer).toBeA('function');
    });

     it('should return the default state', () => {
        expect(showPatientsReducer(undefined, {})).toEqual(initialState)
    })

})
