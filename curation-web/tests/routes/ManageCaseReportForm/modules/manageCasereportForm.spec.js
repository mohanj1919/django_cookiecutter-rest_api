import React from 'react'
import { shallow, mount } from 'enzyme'
import { OnFileUpload,
    UploadClick,
    RemoveFile,
    HandleTextEdit,
    CellEdit,
    AddModal,
    AddResponses,
    RemoveResponse,
    AddQuestion,
    DeleteModal,
    ClearState,
    GetCRFDetails,
    SaveCRFTemplate,
    ValidateCellLength,
    SearchQuestion,
    GetQuestionsList,
    LoadQuestion,
    CancelModal,
    default as manageCaseReportFormsReducer } from '../../../../src/routes/CaseReportForm/routes/ManageCaseReportForm/modules/manageCaseReportForm'
import expect, { createSpy, spyOn, isSpy } from 'expect'

describe('Manage Case Report form actions', () => {
    let actionsCreators = {
        OnFileUpload,
        UploadClick,
        RemoveFile,
        HandleTextEdit,
        CellEdit,
        AddModal,
        AddResponses,
        RemoveResponse,
        AddQuestion,
        DeleteModal,
        ClearState,
        GetCRFDetails,
        SaveCRFTemplate,
        ValidateCellLength,
        SearchQuestion,
        GetQuestionsList,
        LoadQuestion,
        CancelModal
    }
    let actions = {
        FILE_UPLOADED: 'FILE_UPLOADED',
        FILE_SELECTED: 'FILE_SELECTED',
        REMOVE_ADD_FILE: 'REMOVE_ADD_FILE',
        TEMPLATE_INPUT_CHANGE: 'TEMPLATE_INPUT_CHANGE',
        CELL_EDIT_SAVE: 'CELL_EDIT_SAVE',
        ADD_MODAL_TOGGLE: 'ADD_MODAL_TOGGLE',
        ADD_QUESTION: 'ADD_QUESTION',
        ADD_RESPONSE: 'ADD_RESPONSE',
        LOAD_CRF_DETAILS: 'LOAD_CRF_DETAILS',
        REMOVE_RESPONSE: 'REMOVE_RESPONSE',
        DELETE_QUESTION: 'DELETE_QUESTION',
        DELETE_MODAL: 'DELETE_MODAL',
        ADD_CRF_TEMPLATE: 'ADD_CRF_TEMPLATE',
        TABLE_PARENT_VALUE_CHANGED: 'TABLE_PARENT_VALUE_CHANGED',
        CANCEL_ADD_CRF: 'CANCEL_ADD_CRF',
        CLEAR_STATE: 'CLEAR_STATE',
        TOGGLE_NAME_VALIDATION: 'TOGGLE_NAME_VALIDATION',
        SET_PROPS: 'SET_PROPS',
        SAVE_CRF_TEMPLATE: 'SAVE_CRF_TEMPLATE',
        FILE_NAME_VISIBILITY: 'FILE_NAME_VISIBILITY',
        SEARCH_QUESTION: 'SEARCH_QUESTION',
        TOGGLE_CANCEL: 'TOGGLE_CANCEL',
        LOAD_QUESTIONS: 'LOAD_QUESTIONS',
        LOAD_QUESTION_DETAILS: 'LOAD_QUESTION_DETAILS',
        VALIDATE_QUESTION_DATA: 'VALIDATE_QUESTION_DATA'
    }
    it('calls ClearState', () => {
        var csSpy = expect.spyOn(actionsCreators, 'ClearState')
        actionsCreators.ClearState()
        expect(csSpy.calls.length).toEqual(1)
    })
    it('calls GetCRFDetails', () => {
        var csSpy = expect.spyOn(actionsCreators, 'GetCRFDetails')
        let crfId = 1
        actionsCreators.GetCRFDetails()
        expect(csSpy.calls.length).toEqual(1)
    })

    it('Testing OnFileUpload function', () => {
        let files = [new File([""], "filename.csv", { type: "text/plain", lastModified: new Date() })]
        const OnFileUploadfunc = actionsCreators.OnFileUpload(files)
        expect(OnFileUploadfunc).toBeA('function')
        const dispatch = expect.createSpy()
        OnFileUploadfunc(dispatch)
        expect(dispatch).toHaveBeenCalledWith({ type: actions.FILE_SELECTED, payload: {} })
    })
})

describe('Manage case report form Reducer', () => {
    const initialState = {
        isUploadable: false,
        questionData: null,
        filteredquestionData: null,
        uploadedfiles: null,
        templateDetails: {},
        AddModalShow: false,
        newQuestion: {},
        responses: null,
        parent_response: null,
        parentIDList: [],
        DeleteModalShow: false,
        deleteQuestionId: null,
        searchText: null,
        crfData: null,
        questionBank: [],
        parentConditionTypes: [{
            text: 'Contains',
            value: 'contains'
        }, {
                text: 'Equals',
                value: 'equals'
            }],
        questionTypes: [{
            text: 'Single',
            value: 'single'
        }, {
                text: 'Multiple',
                value: 'multiple'
            }, {
                text: 'Numeric',
                value: 'numeric'
            }, {
                text: 'Text',
                value: 'text'
            }, {
                text: 'Date',
                value: 'date'
            }]
    }
    it('Should be a function', () => {
        expect(manageCaseReportFormsReducer).toBeA('function');
    });

    it('should return the default state', () => {
        expect(manageCaseReportFormsReducer(undefined, {})).toEqual(initialState)
    })
})