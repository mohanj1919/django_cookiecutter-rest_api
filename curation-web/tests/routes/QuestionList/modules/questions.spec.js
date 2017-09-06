import React from 'react'
import { shallow, mount } from 'enzyme'
import {LoadQuestionsData,
    handleEditEvent,
    SearchQuestion,
    SortChange,
    PageChanged,
    SizePerPageListChange,
    toggleModal,
    OptionAdded,
    RemoveOption,
    SaveQuestion,
    default as questionReducer } from '../../../../src/routes/QuestionList/modules/questions'
import expect, { createSpy, spyOn, isSpy } from 'expect'

describe('QuestionList Actions', () => {

    let actionsCreators = {
        LoadQuestionsData,
        handleEditEvent,
        SearchQuestion,
        SortChange,
        PageChanged,
        SizePerPageListChange,
        toggleModal,
        OptionAdded,
        RemoveOption,
        SaveQuestion,
    }

    let actions = {
        LOAD_QUESTIONS_DATA : 'LOAD_QUESTIONS_DATA',
        TOGGLE_MODAL : 'TOGGLE_MODAL',
        OPTION_ADDED : 'OPTION_ADDED',
        REMOVE_OPTION : 'REMOVE_OPTION',
        SAVE_QUESTION : 'SAVE_QUESTION',
        SET_PROPS : 'SET_PROPS',
        USER_INPUT_CHANGE : 'USER_INPUT_CHANGE',
        VALIDATE_QUESTION : 'VALIDATE_QUESTION',
    }

    it('should have an all action creators', () => {
        expect(actionsCreators).toExist
    })

    it('Testing LoadQuestionsData function', () => {
        const LQDfunc = actionsCreators.LoadQuestionsData()
        expect(LQDfunc).toBeA('function')
    })

    it('Testing handleEditEvent function', () => {
        const HEEfunc = actionsCreators.handleEditEvent()
        expect(HEEfunc).toBeA('function')
    })

    it('Testing SearchQuestion function', () => {
        const SQfunc = actionsCreators.SearchQuestion()
        expect(SQfunc).toBeA('function')
    })

    it('Testing SortChange function', () => {
        const SCfunc = actionsCreators.SortChange()
        expect(SCfunc).toBeA('function')
    })

    it('Testing PageChanged function', () => {
        const PCfunc = actionsCreators.PageChanged()
        expect(PCfunc).toBeA('function')
    })

    it('Testing SizePerPageListChange function', () => {
        const SPPLCfunc = actionsCreators.SizePerPageListChange()
        expect(SPPLCfunc).toBeA('function')
    })

    it('Testing toggleModal function', () => {
        const TMfunc = actionsCreators.toggleModal()
        expect(TMfunc).toBeA('function')
    })

    it('Testing OptionAdded function', () => {
        const PAfunc = actionsCreators.OptionAdded()
        expect(PAfunc).toBeA('function')
    })

    it('Testing RemoveOption function', () => {
        const ROfunc = actionsCreators.RemoveOption()
        expect(ROfunc).toBeA('function')
    })
    
    it('Testing SaveQuestion function', () => {
        const SvQfunc = actionsCreators.SortChange()
        expect(SvQfunc).toBeA('function')
    })

})

describe('question Reducer', () => {

    const initialState = {
        questions: null,
        showAddModal: false,
        Page: 1,
        selectedObject: null,
        questionTypes: [{ value: 'single', label: 'Single' }, { value: 'multiple', label: 'Multiple' }, { value: 'numeric', label: 'Numeric' }, { value: 'text', label: 'Text' }, { value: 'date', label: 'Date' }],
        showOptions: false,
        questionOptions: null,
        quesOpt: null,
        newQuestion: {},
        isDeletable: false,
        totalCount: 0
    }

    it('Should be a function', () => {
        expect(questionReducer).toBeA('function');
    });

     it('should return the default state', () => {
        expect(questionReducer(undefined, {})).toEqual(initialState)
    })

})