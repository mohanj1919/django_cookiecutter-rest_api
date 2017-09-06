import React from 'react'
import { shallow, mount } from 'enzyme'
import expect, { createSpy, spyOn, isSpy } from 'expect'
import {
        TextEdited,
        SetCurrentInstance,
        SubjectChanged,
        TemplateSelected,
        DefaultTextSelected,
        CancelTemplateDetails,
        SaveTemplateDetails,
        GetTemplateDetails,
        default as chartReviewReducer } from '../../../../src/routes/EmailTemplateDesigner/modules/emailTemplateDesigner'

describe('EmailTemplateDesigner Actions', () => {

    let actionsCreators = {
        TextEdited,
        SetCurrentInstance,
        SubjectChanged,
        TemplateSelected,
        DefaultTextSelected,
        CancelTemplateDetails,
        SaveTemplateDetails,
        GetTemplateDetails,
    }

     let actions = {
        SET_PROP : 'SET_PROP',
        TEMPLATE_DETAILS : 'TEMPLATE_DETAILS',
        TEXT_EDITED : 'TEXT_EDITED',
        TEMPLATE_SELECTED : 'TEMPLATE_SELECTED',
        VALIDATE_TEMPLATE : 'VALIDATE_TEMPLATE',
     }

     it('Testing TextEdited function', () => {
        const GCPfunc = actionsCreators.TextEdited()
        expect(GCPfunc).toBeA('function')
    })

    it('Testing SetCurrentInstance function', () => {
        const GCPfunc = actionsCreators.SetCurrentInstance()
        expect(GCPfunc).toBeA('function')
    })

    it('Testing SubjectChanged function', () => {
        const GCPfunc = actionsCreators.SubjectChanged()
        expect(GCPfunc).toBeA('function')
    })

    it('Testing TemplateSelected function', () => {
        const GCPfunc = actionsCreators.TemplateSelected()
        expect(GCPfunc).toBeA('function')
    })

    it('Testing DefaultTextSelected function', () => {
        const GCPfunc = actionsCreators.DefaultTextSelected()
        expect(GCPfunc).toBeA('function')
    })

    it('Testing CancelTemplateDetails function', () => {
        const GCPfunc = actionsCreators.CancelTemplateDetails()
        expect(GCPfunc).toBeA('function')
    })

    it('Testing SaveTemplateDetails function', () => {
        const GCPfunc = actionsCreators.SaveTemplateDetails()
        expect(GCPfunc).toBeA('function')
    })

    it('Testing GetTemplateDetails function', () => {
        const GCPfunc = actionsCreators.GetTemplateDetails()
        expect(GCPfunc).toBeA('function')
    })

})

describe('chartReview Reducer', () => {

    const initialState = {
    }

    it('Should be a function', () => {
        expect(chartReviewReducer).toBeA('function');
    });

     it('should return the default state', () => {
        expect(chartReviewReducer(undefined, {})).toEqual(initialState)
    })

})
