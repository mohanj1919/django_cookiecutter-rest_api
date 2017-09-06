import React from 'react'
import { connect } from 'react-redux';
import { default as ManageCaseReportForm } from '../../../../src/routes/CaseReportForm/routes/ManageCaseReportForm/components/ManageCaseReportForm'
import { mapDispatchToProps, mapStateToProps } from '../../../../src/routes/CaseReportForm/routes/ManageCaseReportForm/containers/ManageCaseReportFormContainer'
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
    CancelModal } from '../../../../src/routes/CaseReportForm/routes/ManageCaseReportForm/modules/manageCaseReportForm'
import { ValidateUserToken } from '../../../../src/modules/global.js'
import expect from 'expect'

describe('Manage Case Report Form Container', () => {
    let state
    let parentConditions = [{ text: 'Contains', value: 'contains' }, { text: 'Equals', value: 'equals' }]
    let questTypes = [{ text: 'Single', value: 'single' }, { text: 'Multiple', value: 'multiple' }, { text: 'Numeric', value: 'numeric' }, { text: 'Text', value: 'text' }, { text: 'Date', value: 'date' }]
    beforeEach(() => {
        state = {
            managecasereportform: {
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
                parentConditionTypes: parentConditions,
                questionTypes: questTypes
            }
        }
    })
    it('should have all the required methods in mapDispatchToProps object', () => {
        expect(mapDispatchToProps).toEqual({
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
        })
    })
    it('should have the correct mapStateToProps function', () => {
        expect(mapStateToProps(state).parentConditionTypes).toEqual(parentConditions)
        expect(mapStateToProps(state).questionTypes).toEqual(questTypes)
    })
})