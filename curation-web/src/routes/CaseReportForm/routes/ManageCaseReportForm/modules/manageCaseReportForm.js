import {
    HIDE_BANNER,
    TOGGLE_NOTIFICATION,
    TOGGLE_LOADING
} from '../../../../../modules/global.js';
import Papa from 'papaparse'
import browserHistory from 'react-router/lib/browserHistory'
import axios from 'lib/axios'
import _ from 'lodash'
import config from '../../../../../config'

const FILE_UPLOADED = 'FILE_UPLOADED'
const FILE_SELECTED = 'FILE_SELECTED'
const REMOVE_ADD_FILE = 'REMOVE_ADD_FILE'
const TEMPLATE_INPUT_CHANGE = 'TEMPLATE_INPUT_CHANGE'
const CELL_EDIT_SAVE = 'CELL_EDIT_SAVE'
const ADD_MODAL_TOGGLE = 'ADD_MODAL_TOGGLE'
const ADD_QUESTION = 'ADD_QUESTION'
const ADD_RESPONSE = 'ADD_RESPONSE'
const LOAD_CRF_DETAILS = 'LOAD_CRF_DETAILS'
const REMOVE_RESPONSE = 'REMOVE_RESPONSE'
const DELETE_QUESTION = 'DELETE_QUESTION'
const DELETE_MODAL = 'DELETE_MODAL'
const ADD_CRF_TEMPLATE = 'ADD_CRF_TEMPLATE'
const TABLE_PARENT_VALUE_CHANGED = 'TABLE_PARENT_VALUE_CHANGED'
const CANCEL_ADD_CRF = 'CANCEL_ADD_CRF'
const CLEAR_STATE = 'CLEAR_STATE'
const TOGGLE_NAME_VALIDATION = 'TOGGLE_NAME_VALIDATION'
const SET_PROPS = 'SET_PROPS'
const SAVE_CRF_TEMPLATE = 'SAVE_CRF_TEMPLATE'
const FILE_NAME_VISIBILITY = 'FILE_NAME_VISIBILITY'
const SEARCH_QUESTION = 'SEARCH_QUESTION'
const TOGGLE_CANCEL = 'TOGGLE_CANCEL'
const LOAD_QUESTIONS = 'LOAD_QUESTIONS'
const LOAD_QUESTION_DETAILS = 'LOAD_QUESTION_DETAILS'
const VALIDATE_QUESTION_DATA = 'VALIDATE_QUESTION_DATA'


let columns = ['id', 'text', 'responses', 'type', 'parent_question', 'parent_condition', 'parent_response', 'note']

let filedetails = [];
let noOfRows = 0;
let del_parent_ids = []

export function ClearState() {
    return (dispatch) => {
        dispatch({
            type: HIDE_BANNER
        })
        dispatch({
            type: CLEAR_STATE
        })
        dispatch({
            type: HIDE_BANNER
        })
    }
}

export function GetQuestionsList(search) {
    return (dispatch) => {
        let apiparams = search ? { page: 1, page_size: 10, searchParam: search } : { page: 1, page_size: 10 }
        if (search) {
            dispatch({
                type: TEMPLATE_INPUT_CHANGE,
                payload: {
                    key: 'text',
                    value: search,
                }
            })
        }
        axios.get(config.api.get_crf_questions, { params: apiparams })
            .then(function(response) {
                dispatch({
                    type: LOAD_QUESTIONS,
                    payload: response.data
                })
            })
            .catch(function(errors) {
                dispatch({
                    type: TOGGLE_NOTIFICATION,
                    showBanner: true,
                    showTime: 3000,
                    showType: 'error',
                    showMessage: GetErrorMessage(errors.response.data)
                })
            })
    }
}
export function LoadQuestion(selectedObj) {
    return (dispatch) => {
        dispatch({
            type: LOAD_QUESTION_DETAILS,
            payload: selectedObj && selectedObj.length > 0 && Object.keys(selectedObj).length ? selectedObj[0] : null
        })
    }
}
export function GetCRFDetails(crfId) {
    return (dispatch, getState) => {
        dispatch({
            type: HIDE_BANNER
        })
        dispatch(GetQuestionsList())
        if (crfId) {
            dispatch({
                type: SET_PROPS,
                payload: {
                    type: 'crfId',
                    value: crfId
                }
            })
        }
        if (getState().managecasereportform.crfId) {
            let crfgeturl = `${config.api.get_crf_templates}${getState().managecasereportform.crfId}/`
            dispatch({
                type: TOGGLE_LOADING,
                payload: true
            })
            axios.get(crfgeturl)
                .then(function(response) {
                    dispatch({
                        type: LOAD_CRF_DETAILS,
                        payload: response.data
                    })
                    dispatch({
                        type: TOGGLE_LOADING,
                        payload: false
                    })

                })
                .catch(function(errors) {
                    dispatch({
                        type: TOGGLE_LOADING,
                        payload: false
                    })
                    dispatch({
                        type: TOGGLE_NOTIFICATION,
                        showBanner: true,
                        showTime: 3000,
                        showType: 'error',
                        showMessage: errors.message
                    })
                })
        }
    }
}

function GetErrorMessage(errors) {
    let errorMessage = ""
    let error = []
    error = errors && errors.errors && errors.errors.questions ? _.filter(errors.errors.questions, function(err) {
        return Object.keys(err) && (Object.keys(err).length > 0) ? err : null
    }) : null
    if (errors.errors.non_field_errors) {
        error = Object.values(errors.errors.non_field_errors)
    }
    try {
        errorMessage = !errors.errors.non_field_errors ? (error && error[0] ? Object.values(error[0])[0].toString().replace('This', Object.keys(error[0])) : errors.message) : error[0]
    } catch (e) {
        errorMessage = errors.message
    }
    return errorMessage ? errorMessage[0].charAt(0).toUpperCase() + errorMessage.slice(1) : null
}
export function SearchQuestion(event) {
    return (dispatch) => {
        dispatch({
            type: SEARCH_QUESTION,
            payload: event.target.value.replace(/^[ ]+|[ ]+$/g, '')
        })
    }
}
export function SaveCRFTemplate() {
    return (dispatch, getState) => {
        dispatch({
            type: SAVE_CRF_TEMPLATE
        })
        dispatch({
            type: TOGGLE_LOADING,
            payload: true
        })
        let addUrl = getState().managecasereportform.crfId ? `${config.api.get_crf_templates}${getState().managecasereportform.crfId}/` : `${config.api.get_crf_templates}`;
        let method = getState().managecasereportform.crfId ? 'put' : 'post'
        axios[method](addUrl, getState().managecasereportform.crfData)
            .then(function(response) {
                dispatch({
                    type: TOGGLE_LOADING,
                    payload: false
                })
                if (!_.isEmpty(response.data.errors)) {
                    dispatch({
                        type: TOGGLE_NOTIFICATION,
                        payload: true,
                        showTime: null,
                        confirmText: 'Clone',
                        showType: 'warning',
                        showMessage: response.data.errors,
                        messageTitle: `Unable to edit CRF`,
                        successCb: function() {
                            dispatch({
                                type: SET_PROPS,
                                payload: {
                                    type: 'crfId',
                                    value: null
                                }
                            })

                            let templateDetails = getState().managecasereportform.templateDetails;
                            templateDetails.template_name += '_clone';
                            templateDetails.template_desc += '_clone';
                            dispatch({
                                type: SET_PROPS,
                                payload: {
                                    key: 'templateDetails',
                                    value: templateDetails
                                }
                            })
                            dispatch({
                                type: HIDE_BANNER
                            })
                        }
                    })
                } else {
                    window.location.href = '/casereportform'
                    dispatch({
                        type: TOGGLE_NOTIFICATION,
                        showBanner: true,
                        showTime: 3000,
                        showType: 'success',
                        showMessage: getState().managecasereportform.crfId ? 'CRF Template successfully updated' : 'CRF Template successfully added'
                    })
                }
            })
            .catch(function(errors) {
                dispatch({
                    type: TOGGLE_LOADING,
                    payload: false
                })
                if (errors && errors.response && errors.response.data.errors && errors.response.data.errors.name) {
                    dispatch({
                        type: TOGGLE_NAME_VALIDATION,
                        payload: errors && errors.response && errors.response.data.errors && errors.response.data.errors.name &&
                        errors.response.data.errors.name[0].charAt(0).toUpperCase() + errors.response.data.errors.name[0].slice(1)
                    })
                }
                if (errors && errors.response && errors.response.data.errors && (errors.response.data.errors.questions || errors.response.data.errors.non_field_errors)) {
                    dispatch({
                        type: TOGGLE_NOTIFICATION,
                        showBanner: true,
                        showTime: 3000,
                        showType: 'error',
                        showMessage: GetErrorMessage(errors.response.data) ? GetErrorMessage(errors.response.data) : errors.message
                    })
                }
                if (!GetErrorMessage(errors.response.data)) {
                    dispatch({
                        type: TOGGLE_NOTIFICATION,
                        showBanner: true,
                        showTime: 3000,
                        showType: 'error',
                        showMessage: errors && errors.response && errors.response.data.errors ?
                            (getState().managecasereportform.crfId ? 'Unable to update CRF template' : 'Unable to Add CRF Template') : errors.message
                    })
                }
            })
    }
}

export function OnFileUpload(files) {
    let uploadedfile = files[0]
    let fileExt = uploadedfile ? uploadedfile.name.substr(uploadedfile.name.lastIndexOf('.') + 1).toLowerCase() : null
    let fileData = null;
    if (uploadedfile && fileExt == 'csv') {
        return (dispatch) => {
            dispatch({
                type: FILE_SELECTED,
                payload: uploadedfile
            })
            ParseFile(uploadedfile, uploadedfile.name)
        }
    } else {
        return (dispatch) => {
            dispatch({
                type: TOGGLE_NOTIFICATION,
                showBanner: true,
                showTime: 3000,
                showType: 'error',
                showMessage: fileExt != 'csv' ? 'Invalid File type, please upload CSV file' : 'Invalid file'
            })
        }
    }
}

function ParseFile(file, filename) {
    let config = {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            FileUploaded(results, filename)
        },
        error: function(error) {
            dispatch({
                type: TOGGLE_NOTIFICATION,
                showBanner: true,
                showTime: 3000,
                showType: 'error',
                showMessage: 'Error in Parsing file'
            })
        }
    }
    Papa.parse(file, config);
}

export function FileUploaded(res, createdtype) {
    if ([...new Set(filedetails.map(item => item.createdtype))].indexOf(createdtype) == -1) {
        res.data.map((rd, i) => {
            rd.createdtype = createdtype;
            filedetails.push(rd)
        })
        let lowerObj = _.map(filedetails, function(fileRow) {
            return _.transform(fileRow, function(result, val, key) {
                result[key.toLowerCase()] = val;
            });
        })

        filedetails = lowerObj;
    }
}
export function HandleTextEdit(event, id) {
    if (event.target.name == 'table_parent_question' || event.target.name == 'table_question_type' || event.target.name == 'table_parent_condition') {
        return (dispatch) => {
            dispatch({
                type: TABLE_PARENT_VALUE_CHANGED,
                payload: event.target.value,
                id: id,
                key: event.target.name == 'table_parent_question' ?
                    'parent_question' : (event.target.name == 'table_question_type' ?
                        'question_type' : (event.target.name == 'table_parent_condition' ?
                            'parent_condition' : null))
            })
        }
    } else {
        return (dispatch) => {
            dispatch({
                type: TEMPLATE_INPUT_CHANGE,
                payload: {
                    key: event.target.name,
                    value: event.target.value,
                }
            })
        }
    }
}
export function CancelModal() {
    return (dispatch, getState) => {
        dispatch({
            type: TOGGLE_CANCEL
        })
        dispatch({
            type: TOGGLE_NOTIFICATION,
            payload: true,
            showTime: null,
            showType: 'warning',
            showMessage: !getState().managecasereportform.crfId ? 'Are you sure to cancel Adding CRF template ?' : 'Are you sure to cancel Editing CRF template ?',
            messageTitle: !getState().managecasereportform.crfId ? 'Cancel Adding CRF' : 'Cancel Editing CRF',
            successCb: function() {
                if (!getState().managecasereportform.crfId) {
                    dispatch({
                        type: CANCEL_ADD_CRF
                    })
                }
                dispatch({
                    type: HIDE_BANNER
                })
                window.location.href = '/casereportform'
                dispatch({
                    type: TOGGLE_NOTIFICATION,
                    payload: true,
                    showTime: 4000,
                    showType: 'success',
                    showMessage: !getState().managecasereportform.crfId ? 'Adding CRF template action Successfully discarded' : 'Editing CRF template action Successfully discarded'
                })
            }
        })
    }
}

export function UploadClick() {
    if (filedetails) {
        let validFile = true;

        let csvcolumns = _.map(Object.keys(filedetails[0]), function(e) {
            return e.toLowerCase()
        })
        columns.map((c) => {
            if (csvcolumns.indexOf(c.toLowerCase()) == -1) {
                validFile = false;
            }
        })

        if (validFile) {
            return (dispatch) => {
                dispatch({
                    type: TOGGLE_LOADING,
                    payload: true
                })
                dispatch({
                    type: FILE_UPLOADED,
                    payload: filedetails
                })
                dispatch({
                    type: TOGGLE_NOTIFICATION,
                    showBanner: true,
                    showTime: 3000,
                    showType: 'success',
                    showMessage: 'File/Files Successfully uploaded to Table'
                })
                dispatch({
                    type: FILE_NAME_VISIBILITY
                })
                dispatch({
                    type: TOGGLE_LOADING,
                    payload: false
                })
            }
        } else {
            return (dispatch) => {
                dispatch({
                    type: TOGGLE_NOTIFICATION,
                    showBanner: true,
                    showTime: 3000,
                    showType: 'error',
                    showMessage: 'Invalid Data found, please upload file with required columns'
                })
            }
        }
    }
}
export function AddResponses(item) {
    return (dispatch) => {
        dispatch({
            type: ADD_RESPONSE,
            payload: item
        })
    }
}

export function RemoveResponse(ind, item) {
    return (dispatch) => {
        dispatch({
            type: REMOVE_RESPONSE,
            payload: ind,
            item: item
        })
    }
}

export function AddModal() {
    return (dispatch) => {
        dispatch({
            type: ADD_MODAL_TOGGLE
        })
    }
}

export function RemoveFile(filename) {
    let updatedFileDetails = [];
    noOfRows = 0;
    filedetails.map((fd, i) => {
        if (filename != fd.createdtype) {
            updatedFileDetails.push(fd)
        } else {
            noOfRows++;
            del_parent_ids.push(parseInt(fd.parent_question))
        }
    })
    filedetails = updatedFileDetails;
    return (dispatch) => {
        dispatch({
            type: REMOVE_ADD_FILE,
            payload: filedetails,
            filename: filename
        })
    }
}

export function CellEdit(row, cellName, cellValue) {
    return (dispatch) => {
        dispatch({
            type: CELL_EDIT_SAVE,
            payload: cellValue.replace(/^[ ]+|[ ]+$/g, ''),
            id: row.question_id,
            cellName: cellName
        })
    }
}
export function ValidateCellLength() {
    return (dispatch) => {
        dispatch({
            type: TOGGLE_NOTIFICATION,
            showBanner: true,
            showTime: 3000,
            showType: 'error',
            showMessage: 'Cell value should not exceed 250 characters'
        })
    }
}

export function AddQuestion() {
    return (dispatch, getState) => {
        dispatch({
            type: VALIDATE_QUESTION_DATA
        })
        if (getState().managecasereportform.isValid) {
            dispatch({
                type: ADD_QUESTION
            })
        }
    }
}

export function DeleteModal(id) {
    return (dispatch) => {
        dispatch({
            type: DELETE_MODAL,
            payload: id
        })
        dispatch({
            type: TOGGLE_NOTIFICATION,
            payload: true,
            showTime: null,
            showType: 'warning',
            showMessage: 'Are you sure to delete this Question ?',
            messageTitle: 'Complete Curation',
            successCb: function() {
                dispatch({
                    type: DELETE_QUESTION
                })
                dispatch({
                    type: HIDE_BANNER
                })
                dispatch({
                    type: TOGGLE_NOTIFICATION,
                    payload: true,
                    showTime: 3000,
                    showType: 'success',
                    showMessage: 'Question removed successfully'
                })
            }
        })
    }
}

export function GetFilteredQuestions(questionData, payload) {
    let questions = []
    if (questionData && payload) {
        questionData.map((qd, i) => {
            if (qd) {
                if ((qd.text ? qd.text.toLowerCase().indexOf(payload.toLowerCase()) > -1 : false) ||
                    (qd.type ? qd.type.toLowerCase().indexOf(payload.toLowerCase()) > -1 : false) ||
                    (qd.responses ? qd.responses.toLowerCase().indexOf(payload.toLowerCase()) > -1 : false) ||
                    (qd.parent_question ? qd.parent_question.toString().indexOf(payload.toLowerCase()) > -1 : false) ||
                    (qd.parent_condition ? qd.parent_condition.toLowerCase().indexOf(payload.toLowerCase()) > -1 : false) ||
                    (qd.note ? qd.note.toLowerCase().indexOf(payload.toLowerCase()) > -1 : false)) {
                    if (qd.is_active) {
                        questions.push(qd);
                    }
                }
            }
        })
    } else {
        questions = questionData;
    }
    return questions
}
const ACTION_HANDLERS = {

    [VALIDATE_QUESTION_DATA]: (state, action) => {
        let valid = true;
        let validatingObj = Object.assign({}, state.newQuestion)
        if (validatingObj) {
            if (!validatingObj.question_type || (validatingObj.question_type == '0')) {
                validatingObj.question_typeValidationState = 'error'
                validatingObj.question_typeHelp = 'Question type is required'
                valid = false
            }
            if (validatingObj.parent_question && validatingObj.parent_question != '0') {
                if (!validatingObj.parent_response || (validatingObj.parent_response == '0')) {
                    validatingObj.parent_responseValidationState = 'error'
                    validatingObj.parent_responseHelp = 'Parent response is required'
                    valid = false
                }
                if (!validatingObj.parent_condition || (validatingObj.parent_condition == '0')) {
                    validatingObj.parent_conditionValidationState = 'error'
                    validatingObj.parent_conditionHelp = 'Parent Condition is required'
                    valid = false
                }
            }
            if ((validatingObj.question_type && validatingObj.question_type != 'text' && validatingObj.question_type != 'date' && validatingObj.question_type != 'numeric') &&
                !validatingObj.responses || (validatingObj.responses && validatingObj.responses.length == 0)) {
                validatingObj.responsesValidationState = 'error'
                validatingObj.responsesHelp = 'Responses are required'
                valid = false
            }
            if (validatingObj.responseMaxValue && validatingObj.responseMinValue) {
                if (validatingObj.responseMaxValue < validatingObj.responseMinValue) {
                    validatingObj.responseMaxValueValidationState = 'error'
                    validatingObj.responseMaxValueHelp = 'Maximum value should be greater than Minimum value'
                    valid = false
                }
            }
        }
        return Object.assign({}, state, {
            newQuestion: validatingObj,
            isValid: valid
        })
    },
    [LOAD_QUESTION_DETAILS]: (state, action) => {
        if (action.payload) {
            let responses = action.payload.responses ? action.payload.responses.split(',') : []
            let selectedObject = {
                question_type: action.payload.type,
                text: action.payload.text,
                responses: action.payload.type != 'numeric' && action.payload.type != 'text' && action.payload.type != 'date' ? (responses) : null,
                responseMinValue: action.payload.type == 'numeric' ? (responses && responses.length > 0 ? responses[0] : null) : null,
                responseMaxValue: action.payload.type == 'numeric' ? (responses && responses.length > 0 ? responses[1] : null) : null,
                parent_question: state.newQuestion && state.newQuestion.parent_question && state.newQuestion.parent_question != '0' ? state.newQuestion.parent_question : null
            }
            return Object.assign({}, state, {
                newQuestion: selectedObject
            })
        }
        return Object.assign({}, state)
    },
    [LOAD_QUESTIONS]: (state, action) => {
        return Object.assign({}, state, {
            questionBank: action.payload
        })
    },
    [TOGGLE_CANCEL]: (state, action) => {
        return Object.assign({}, state, {
            CancelModalShow: !state.CancelModalShow
        })
    },
    [SEARCH_QUESTION]: (state, action) => {
        let filteredData = GetFilteredQuestions(state.templateDetails.questionData, action.payload)
        let temp_details = Object.assign({}, state.templateDetails, {
            filteredquestionData: filteredData
        })
        return Object.assign({}, state, {
            searchText: action.payload,
            templateDetails: temp_details
        })
    },
    [LOAD_CRF_DETAILS]: (state, action) => {
        let parentIds = []
        if (action.payload) {
            let templateDetails = {}
            templateDetails.template_desc = action.payload.description,
                templateDetails.template_name = action.payload.name
            templateDetails.questionData = []
            if (action.payload.questions) {
                action.payload.questions.map((qd, i) => {
                    templateDetails.questionData.push({
                        id: qd.id,
                        question_id: qd.question_id,
                        text: qd.text,
                        question_type: qd.question_type.toLowerCase(),
                        responses: qd.responses,
                        parent_question: qd.parent_question ? parseInt(qd.parent_question) : '',
                        parent_response: qd.parent_response,
                        note: qd.note,
                        parent_condition: qd.parent_condition ? qd.parent_condition.toLowerCase() : '',
                        is_active: qd.is_active
                    })
                    parentIds.push(qd.question_id)
                })
            }
            templateDetails.filteredquestionData = templateDetails.questionData;
            return Object.assign({}, state, {
                templateDetails: templateDetails,
                uploadedfiles: null,
                parentIDList: parentIds
            })
        }
        return Object.assign({}, state)
    },
    [SAVE_CRF_TEMPLATE]: (state, action) => {
        let crfData = {}
        crfData.description = state.templateDetails.template_desc,
            crfData.name = state.templateDetails.template_name,
            crfData.questions = [];
        if (state.templateDetails.questionData) {
            state.templateDetails.questionData.map((qd, i) => {
                crfData.questions.push({
                    question_id: qd.question_id,
                    id: qd.id,
                    text: qd.text,
                    question_type: qd.question_type.toLowerCase(),
                    responses: qd.responses,
                    parent_question: qd.parent_question ? qd.parent_question.toString() : "",
                    parent_response: qd.parent_response && qd.parent_question ? qd.parent_response : null,
                    note: qd.note ? qd.note : null,
                    parent_condition: qd.parent_condition ? qd.parent_condition : null,
                    is_active: _.isUndefined(qd.is_active) ? true : qd.is_active
                })
            })
            filedetails = [];
        }
        return Object.assign({}, state, {
            crfData: crfData
        })
    },
    [TOGGLE_NAME_VALIDATION]: (state, action) => {
        return Object.assign({}, state, {
            name_validation: action.payload,
            showNameValidation: true
        })
    },
    [CLEAR_STATE]: (state, action) => {
        let newState = Object.assign({}, initialState)
        return Object.assign({}, newState)
    },
    [CANCEL_ADD_CRF]: (state, action) => {
        noOfRows = 0;
        del_parent_ids = [];
        filedetails = [];
        return Object.assign({}, state, {
            crfData: null,
            uploadedfiles: null,
            templateDetails: null,
            CancelModalShow: !state.CancelModalShow
        })
    },
    [FILE_SELECTED]: (state, action) => {
        if (action.payload) {
            let files = [];
            state.uploadedfiles = state.crfId && !state.isFilesVisible ? [] : (state.uploadedfiles ? state.uploadedfiles : [])
            state.uploadedfiles.map((f) => {
                files.push(f)
            })

            if ([...new Set(files.map(item => item.name.toLowerCase()))].indexOf(action.payload.name.toLowerCase()) == -1)
                files.push(action.payload)

            return Object.assign({}, state, {
                uploadedfiles: files,
                isFilesVisible: true,
                isUploadable: true
            })
        }
        return Object.assign({}, state)
    },
    [FILE_UPLOADED]: (state, action) => {
        if (action.payload) {
            let quesData = [];
            let maxId = 0;
            let file_data = 0
            if (state.templateDetails && state.templateDetails.questionData) {
                state.templateDetails.questionData.map((qd, i) => {
                    if (state.crfId) {
                        qd.is_active = true
                        qd.parent_question = qd.parent_question ? parseInt(qd.parent_question) : ""
                        qd.question_type = qd.type ? qd.type.toLowerCase() : qd.question_type
                        qd.parent_condition = qd.parent_condition ? qd.parent_condition.toLowerCase() : null
                        quesData.push(qd)
                    } else {
                        if (qd.createdtype == 'custom')
                            quesData.push(qd)
                        else {
                            let file_data = [...new Set(filedetails.map(item => item.createdtype))].indexOf(qd.createdtype)
                            if (file_data > -1) {
                                qd.type = qd.type.toLowerCase()
                                quesData.push(qd)
                            }
                        }
                    }
                })
            } else {
                state.templateDetails.questionData = []
            }
            maxId = quesData && quesData.length > 0 ? _.maxBy(quesData, function(q) {
                return q.question_id;
            }) : 0;
            maxId = maxId ? maxId.question_id : 0;
            let lastIndex = maxId;
            action.payload.map((ap, i) => {
                file_data = [...new Set(state.templateDetails.questionData.map(item => item.createdtype))].indexOf(ap.createdtype)
                if (file_data == -1) {
                    maxId++;
                    ap.is_active = true
                    ap.id = null
                    ap.question_type = ap.type ? ap.type.toLowerCase() : ''
                    ap.question_id = parseInt(maxId)
                    ap.parent_condition = ap.parent_condition ? ap.parent_condition.toLowerCase() : null
                    if (ap.parent_question) {
                        ap.parent_question = (parseInt(ap.parent_question) + lastIndex)
                    }
                    quesData.push(ap)
                }
            })

            let temp = Object.assign({}, state.templateDetails, {
                questionData: quesData,
                filteredquestionData: state.searchText ? GetFilteredQuestions(quesData, state.searchText) : quesData
            })
            let parentids = []
            quesData.map((a) => {
                parentids.push(a.question_id)
            });
            return Object.assign({}, state, {
                templateDetails: temp,
                parentIDList: parentids
            })
        }
        return Object.assign({}, state)
    },
    [REMOVE_ADD_FILE]: (state, action) => {
        let questions = []
        let maxId = 0;
        let deleteableQues = _.filter(state.templateDetails.questionData, function(q) {
            if (q.createdtype) {
                return q.createdtype.toLowerCase() == action.filename.toLowerCase()
            }
        })
        del_parent_ids = _.map(deleteableQues, function(q) {
            return q.question_id
        })
        if (state.templateDetails && state.templateDetails.questionData) {
            let quesId = 1;
            state.templateDetails.questionData.map((qd, i) => {
                qd.question_id = quesId
                if (deleteableQues && deleteableQues.length) {
                    if (parseInt(qd.parent_question) > deleteableQues[deleteableQues.length - 1].question_id) {
                        qd.parent_question = qd.parent_question > noOfRows ? qd.parent_question - noOfRows : qd.parent_question;
                    }
                }
                if (!state.crfId) {
                    if (qd.createdtype == 'custom') {
                        questions.push(qd)
                        quesId++;
                    } else {
                        let file_data = [...new Set(filedetails.map(item => item.createdtype))].indexOf(qd.createdtype)
                        if (file_data > -1) {
                            questions.push(qd)
                            quesId++;
                        }
                    }
                } else {
                    questions.push(qd)
                    quesId++;
                }
            })
        }
        let parentIDs = _.map(questions, function(q) {
            return q.question_id
        })
        let temp = Object.assign({}, state.templateDetails, {
            questionData: questions,
            filteredquestionData: state.searchText ? GetFilteredQuestions(questions, state.searchText) : questions
        })
        let files = [];
        state.uploadedfiles.map((uf, i) => {
            if (uf.name != action.filename) {
                files.push(uf)
            }
        })
        let uploadble = false
        let filesUploaded = _.map(questions, function(f) {
            if (f.createdtype) {
                return f.createdtype.toLowerCase()
            }
        })
        if (filesUploaded && files) {
            files.map((f) => {
                if (f.name) {
                    if (filesUploaded.indexOf(f.name.toLowerCase()) == -1) {
                        uploadble = files && files.length > 0 ? true : false
                    }
                }
            })
        }
        return Object.assign({}, state, {
            uploadedfiles: files,
            templateDetails: temp,
            parentIDList: parentIDs,
            isUploadable: uploadble
        })
    },
    [TEMPLATE_INPUT_CHANGE]: (state, action) => {
        if (action.payload.key == 'template_name' || action.payload.key == 'template_desc') {
            let showNameValidation = state.showNameValidation;
            let name_validation = state.name_validation;
            if (action.payload.key == 'template_name') {
                showNameValidation = false
                name_validation = ''
            }
            let temp = Object.assign({}, state.templateDetails, {
                [action.payload.key]: action.payload.value
            })
            return Object.assign({}, state, {
                templateDetails: temp,
                showNameValidation: showNameValidation,
                name_validation: name_validation
            })
        } else if (action.payload.key == 'responses' || action.payload.key == 'parent_response') {
            return Object.assign({}, state, {
                [action.payload.key]: action.payload.value,
                newQuestion: (Object.assign({}, state.newQuestion, {
                    [action.payload.key + 'ValidationState']: null,
                    [action.payload.key + 'Help']: null
                }))
            })
        } else {
            let newques = {}
            newques = Object.assign({}, state.newQuestion, {
                [action.payload.key + 'ValidationState']: null,
                [action.payload.key + 'Help']: null
            })
            if (action.payload.key == 'parent_question') {
                if (action.payload.value == '0') {
                    newques = Object.assign({}, state.newQuestion, {
                        parent_response: null,
                        parent_condition: null,
                        parent_question: "",
                        parent_responseHelp: null,
                        parent_conditionHelp: null,
                        parent_questionHelp: null,
                        parent_responseValidationState: null,
                        parent_conditionValidationState: null,
                        parent_questionValidationState: null
                    })
                }
            }
            newques[action.payload.key] = action.payload.key == 'question_type' || action.payload.key == 'parent_question' ?
                (action.payload.value != '0' ? action.payload.value : null) : action.payload.value
            let quesResponse = action.payload.key == 'question_type' &&
                action.payload.value != 'text' &&
                action.payload.value != 'date' &&
                action.payload.value != '0' &&
                action.payload.value != 'numeric'
            newques['responses'] = newques['question_type'] &&
                newques['question_type'] != 'text' &&
                newques['question_type'] != 'date' &&
                newques['question_type'] != 'numeric' &&
                newques['question_type'] != '0' &&
                newques['responses'] &&
                newques['responses'].length > 0 ? newques['responses'] : null
            return Object.assign({}, state, {
                newQuestion: Object.assign({}, newques, {
                    parent_condition: action.payload.key == 'parent_condition' ? (action.payload.value == '0' ? null : action.payload.value) : newques.parent_condition,
                    responseMaxValue: (action.payload.key != 'responseMaxValue' && action.payload.key != 'responseMinValue') && newques.question_type != 'numeric' ? null : newques.responseMaxValue,
                    responseMinValue: (action.payload.key != 'responseMaxValue' && action.payload.key != 'responseMinValue') && newques.question_type != 'numeric' ? null : newques.responseMinValue
                }, ),
                parent_condition: action.payload.key == 'parent_question' && action.payload.value == '0' ? null : state.parent_condition,
                parent_response: action.payload.key == 'parent_question' && action.payload.value == '0' ? null : state.parent_response,
                responses: quesResponse ? state.responses : null
            })
        }
    },
    [CELL_EDIT_SAVE]: (state, action) => {
        let questions = [];
        if (state.templateDetails) {
            state.templateDetails.questionData.map((qd, i) => {
                if (qd.question_id == action.id) {
                    qd[action.cellName] = action.payload
                }
                questions.push(qd);
            })
            let temp = Object.assign({}, state.templateDetails, {
                questionData: questions
            })
            return Object.assign({}, state, {
                templateDetails: temp
            })
        }
        return Object.assign({}, state)
    },
    [ADD_MODAL_TOGGLE]: (state, action) => {
        return Object.assign({}, state, {
            AddModalShow: !state.AddModalShow,
            newQuestion: null,
            responses: null,
            parent_response: null
        })
    },
    [ADD_QUESTION]: (state, action) => {
        let questions = [];
        let maxId = _.maxBy(state.templateDetails.questionData, function(o) {
            return o.question_id;
        });
        let parentids = [];
        let newques = {}
        newques.question_id = parseInt(maxId && maxId.question_id ? maxId.question_id : 0) + 1
        newques.text = state.newQuestion.text
        newques.question_type = state.newQuestion.question_type.toLowerCase()
        newques.responses = state.newQuestion.question_type != 'text' && state.newQuestion.question_type != 'date' ? (state.newQuestion.question_type != 'numeric' ? (state.newQuestion.responses ? state.newQuestion.responses.join(",") : null) :
            (state.newQuestion.responseMinValue ? state.newQuestion.responseMinValue : 'None') + ',' + (state.newQuestion.responseMaxValue ? state.newQuestion.responseMaxValue : 'None')) : null
        newques.parent_response = state.newQuestion.parent_response ? state.newQuestion.parent_response.join(",") : null
        newques.parent_question = parseInt(state.newQuestion.parent_question)
        newques.parent_condition = state.newQuestion.parent_condition
        newques.note = state.newQuestion.note
        newques.is_active = true
        newques.createdtype = 'custom'
        questions.push(newques)
        parentids.push(newques.question_id)
        if (state.templateDetails.questionData) {
            state.templateDetails.questionData.map((qd, i) => {
                questions.push(qd)
                parentids.push(qd.question_id)
            })
        }
        let temp = Object.assign({}, state.templateDetails, {
            questionData: questions,
            filteredquestionData: state.searchText ? GetFilteredQuestions(questions, state.searchText) : questions
        })
        return Object.assign({}, state, {
            templateDetails: temp,
            newQuestion: null,
            AddModalShow: !state.AddModalShow,
            parentIDList: parentids
        })
    },
    [ADD_RESPONSE]: (state, action) => {
        let newques = Object.assign({}, state.newQuestion)
        newques[action.payload] = newques[action.payload] ? newques[action.payload] : []
        if (state[action.payload]) {
            if (newques[action.payload].map(function(x) {
                return x.toLowerCase()
            }).indexOf(state[action.payload].toLowerCase()) == -1) {
                newques[action.payload].push(state[action.payload])
            } else {
                newques[action.payload + 'Help'] = `${state[action.payload]} is already existed in Responses`
            }
        } else {
            newques[action.payload + 'Help'] = 'Cannot add empty responses'
        }
        return Object.assign({}, state, {
            newQuestion: newques,
            [action.payload]: null
        })
    },
    [REMOVE_RESPONSE]: (state, action) => {
        let newques = Object.assign({}, state.newQuestion)
        let newRes = []
        newques[action.item].map((nq, i) => {
            if (i != action.payload) {
                newRes.push(nq)
            }
        })
        newques[action.item] = newRes
        return Object.assign({}, state, {
            newQuestion: newques
        })
    },
    [DELETE_MODAL]: (state, action) => {
        return Object.assign({}, state, {
            deleteQuestionId: action.payload,
            DeleteModalShow: !state.DeleteModalShow
        })
    },
    [DELETE_QUESTION]: (state, action) => {
        let questions = [];
        let parentQuesIDs = [];
        state.templateDetails.questionData.map((qd, i) => {
            if (qd.question_id != state.deleteQuestionId) {
                if (parseInt(qd.parent_question) == parseInt(state.deleteQuestionId)) {
                    qd.parent_question = null
                }
                qd.is_active = qd.is_active
                questions.push(qd)
                parentQuesIDs.push(qd.question_id)
            } else {
                qd.is_active = false
                questions.push(qd)
            }
        })
        let temp = Object.assign({}, state.templateDetails, {
            questionData: questions,
            filteredquestionData: state.searchText ? GetFilteredQuestions(questions, state.searchText) : _.filter(questions, function(q) {
                return q.is_active;
            })
        })
        return Object.assign({}, state, {
            templateDetails: temp,
            DeleteModalShow: !state.DeleteModalShow,
            parentIDList: parentQuesIDs
        })
    },
    [TABLE_PARENT_VALUE_CHANGED]: (state, action) => {
        let questions = [];
        state.templateDetails.questionData.map((qd, i) => {
            if (qd.question_id == action.id) {
                qd[action.key] = action.payload ? action.key == 'parent_question' ?
                    parseInt(action.payload) : action.payload.toLowerCase() : null
            }
            questions.push(qd)
        })
        let temp = Object.assign({}, state.templateDetails, {
            questionData: questions
        })
        return Object.assign({}, state, {
            templateDetails: temp
        })
    },
    [SET_PROPS]: (state, action) => {
        return Object.assign({}, state, {
            [action.payload.type]: action.payload.value
        })
    },
    [FILE_NAME_VISIBILITY]: (state, action) => {
        return Object.assign({}, state, {
            isFilesVisible: state.crfId ? false : true,
            isUploadable: false
        })
    }
}

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

export default function manageCaseReportFormsReducer(state = initialState, action) {
    const handler = ACTION_HANDLERS[action.type]
    return handler ?
        handler(state, action) :
        state
}
