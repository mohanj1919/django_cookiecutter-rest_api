import React, { Component } from 'react'
import { Button, ControlLabel, FormGroup, FormControl, InputGroup, Modal, DropdownButton, MenuItem, Radio, HelpBlock, ButtonGroup } from 'react-bootstrap'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import Dropzone from 'react-dropzone'
import './ManageCaseReportFormStyles.scss'
import FieldGroup from '../../../../../components/FieldGroup';
import { HideBanner } from '../../../../../modules/global.js';
import { Typeahead, AsyncTypeahead } from 'react-bootstrap-typeahead'
import _ from 'lodash'

class ManageCaseReportForm extends Component {
    componentWillMount() {
        this.props.ClearState();
        if (this.props.routeParams && this.props.routeParams.crfId)
            this.props.GetCRFDetails(this.props.routeParams.crfId)
    }

    render() {
        var tableCell = (cell, row) => {
            return (
                <span className='file-data' title={cell}>{cell}</span>
            )
        }
        var activeFormatter = (cell, row) => {
            return (
                <div>
                    <span className='delete-button'>
                        <Button bsStyle='danger' onClick={() => this.props.DeleteModal(row.question_id) } title={'Delete Question'}>
                            <i className='fa fa-trash-o' aria-hidden='true'></i>
                        </Button>
                    </span>
                </div>
            );
        }
        var ParentIDList = (cell, row) => {
            let parentids = []
            let questiondata = this.props.templateDetails && this.props.templateDetails.questionData ? _.filter(this.props.templateDetails.questionData, function (q) { return q.is_active; }) : null
            if (questiondata) {
                questiondata.map((qd, i) => {
                    if (parseInt(row.question_id) != parseInt(qd.question_id)) {
                        if (parseInt(row.question_id) != parseInt(qd.parent_question)) {
                            parentids.push(qd.question_id)
                        }
                    }
                })
            }

            return (
                <FormControl name='table_parent_question' componentClass='select'
                    value={row && row.parent_question ? parseInt(row.parent_question) : 0} id='SelectParentQuestion' onChange={(e) => this.props.HandleTextEdit(e, row.question_id) }>
                    <option key={0} value={0}>-</option>
                    {parentids ? parentids.map((pi, i) => (
                        parseInt(row.question_id) != parseInt(pi) ? <option key={i} value={parseInt(pi) }>{pi}</option> : null
                    )) : null}
                </FormControl>
            )
        }
        var QuestionTypeCell = (cell, row) => {
            return (
                <FormControl name='table_question_type' componentClass='select'
                    value={row && row.question_type ? row.question_type : 0} id='SelectQuestionType' onChange={(e) => this.props.HandleTextEdit(e, row.question_id) }>
                    <option key={0} value={0}>-</option>
                    {this.props.questionTypes.map((qt, i) => (
                        <option key={i} value={qt.value}>{qt.text}</option>
                    )) }
                </FormControl>
            )
        }
        var ParentResponseList = (cell, row) => {
            return (
                <FormControl name='table_parent_condition' componentClass='select' disabled={row && row.parent_question ? false : true}
                    value={row && row.parent_condition ? row.parent_condition : ''} id='SelectParentCondition' onChange={(e) => this.props.HandleTextEdit(e, row.question_id) }>
                    <option key={0} value={0}>Select</option>
                    {this.props.parentConditionTypes.map((pr, i) => (
                        <option key={i} value={pr.value}>{pr.text}</option>
                    )) }
                </FormControl>
            )
        }
        var cellEditProp = {
            mode: 'click',
            blurToSave: true,
            beforeSaveCell: this.props.CellEdit
        }
        var NoteValidator = (value) => {
            const response = { isValid: true };
            if (value.length > 250) {
                response.isValid = false;
                this.props.ValidateCellLength()
            }
            return response;
        }
        var AddQuestionButton = (props) => {
            return (
                <div>
                    <Button onClick={() => this.props.AddModal() } bsStyle='primary'>
                        <i className='fa fa-plus' aria-hidden='true'></i> Add Question
                    </Button>
                    {props.exportCSVBtn}
                </div>
            )
        }

        var customSearchField = () => {
            return (
                <InputGroup className='search-questions'>
                    <input type='text' placeholder='Search Question' onChange={(e) => this.props.SearchQuestion(e) } className='form-control'/>
                    <InputGroup.Addon><i className='fa fa-search'></i></InputGroup.Addon>
                </InputGroup>
            );
        }
        var editableCol = (cell, row) => {
            if (row && row.parent_question)
                return true
            return false
        }
        var responsesEditCol = (cell, row) => {
            if (row && row.question_type && row.question_type != 'text')
                return true
            return false
        }
        var options = {
            exportCSVText: 'Export as CSV',
            paginationShowsTotal: true,
            btnGroup: AddQuestionButton,
            defaultSortName: 'question_id',  // default sort column name
            defaultSortOrder: 'asc',  // default sort order
            searchField: customSearchField
        }

        return (
            <div>
                <div className='container-fluid template-data'>
                    <div className='col-lg-offset-1 col-lg-3 col-md-5 template-details'>
                        <FormGroup validationState={this.props.showNameValidation ? 'error' : null}>
                            <ControlLabel className='required'>CRF Name</ControlLabel>
                            {this.props.routeParams && this.props.routeParams.crfId ?
                                <FormControl type='text' name='template_name' value={this.props.templateDetails ? this.props.templateDetails.template_name : ''}  onChange={this.props.HandleTextEdit} />
                                :
                                <FormControl type='text' name='template_name' onChange={this.props.HandleTextEdit} />
                            }
                            {this.props.showNameValidation ? <HelpBlock className='error'>{this.props.name_validation}</HelpBlock> : null}
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel className='required'>Description</ControlLabel>
                            {this.props.routeParams && this.props.routeParams.crfId ?
                                <FormControl type='text' name='template_desc' maxLength='250' value={this.props.templateDetails ? this.props.templateDetails.template_desc : ''}  onChange={this.props.HandleTextEdit} />
                                :
                                <FormControl type='text' name='template_desc' onChange={this.props.HandleTextEdit} />
                            }
                            {this.props.templateDetails && this.props.templateDetails.template_desc
                                ? <HelpBlock>Characters Remaining: {250 - parseInt(this.props.templateDetails.template_desc.length) }</HelpBlock>
                                : <HelpBlock>Characters Remaining: 250</HelpBlock>}
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>Load CRF Using CSV file</ControlLabel>
                            <div className='file-upload-div'>
                                <div>
                                    <div className='drop-zone-div'>
                                        <InputGroup>
                                            <Dropzone onDrop={this.props.OnFileUpload} multiple>
                                                <p>Click or Drop file to Upload.</p>
                                            </Dropzone>
                                            <InputGroup.Button>
                                                <Button onClick={() => this.props.UploadClick() } bsStyle='success'
                                                    disabled={!this.props.isUploadable}>Upload</Button>
                                            </InputGroup.Button>
                                        </InputGroup>
                                    </div>
                                    {this.props.isFilesVisible ?
                                        <div className='file-name'>
                                            {this.props.uploadedfiles ? this.props.uploadedfiles.map((fd, i) =>
                                                <span title={fd.name} key={i}>{fd.name} <i className='fa fa-times' onClick={() => this.props.RemoveFile(fd.name) }></i><br /></span>
                                            ) : null}
                                        </div>
                                        : null
                                    }
                                </div>
                            </div>
                        </FormGroup>
                    </div>
                </div>
                <div className='container-fluid question-data'>
                    <div className='col-lg-offset-1 col-lg-10 col-md-12'>
                        <BootstrapTable
                            striped={true}
                            hover={true}
                            data={this.props.templateDetails && this.props.templateDetails.filteredquestionData ? this.props.templateDetails.filteredquestionData : []}
                            pagination
                            cellEdit={cellEditProp}
                            options={options}
                            search={true}
                            exportCSV
                            csvFileName= {this.props.templateDetails && this.props.templateDetails.template_name ? this.props.templateDetails.template_name + '.csv' : 'questions_data' + '.csv'}
                            >
                            <TableHeaderColumn dataField='question_id' width='6%' isKey={true} dataSort={true}>Id</TableHeaderColumn>
                            <TableHeaderColumn dataFormat={tableCell} width='23%' dataField='text'dataSort={true}>Question Text</TableHeaderColumn>
                            <TableHeaderColumn dataFormat={QuestionTypeCell} width='10%' editable={false} dataField='type' dataSort={false}>Question Type</TableHeaderColumn>
                            <TableHeaderColumn dataFormat={tableCell} width='10%' dataField='responses' editable={responsesEditCol} dataSort={true}>Responses</TableHeaderColumn>
                            <TableHeaderColumn dataFormat={ParentIDList} width='10%' editable={false} dataField='parent_question'>Parent Question</TableHeaderColumn>
                            <TableHeaderColumn dataFormat={ParentResponseList} width='10%' dataField='parent_condition' editable={false} dataSort={true}>Parent Condition</TableHeaderColumn>
                            <TableHeaderColumn dataFormat={tableCell} width='10%' dataField='parent_response' editable={editableCol}  dataSort={true}>Parent Response</TableHeaderColumn>
                            <TableHeaderColumn dataFormat={tableCell} width='10%' editable={{ type: 'textarea', validator: NoteValidator }} dataField='note' dataSort={true}>Note</TableHeaderColumn>
                            <TableHeaderColumn dataFormat={activeFormatter} width='8%' editable={false} >Actions</TableHeaderColumn>
                        </BootstrapTable>
                    </div>
                    <div className='col-md-12'>
                        <div className='submit-crf-style'>
                            <Button bsStyle='success'
                                disabled={this.props.templateDetails
                                    && this.props.templateDetails.template_name
                                    && this.props.templateDetails.template_desc
                                    && this.props.templateDetails.questionData
                                    && this.props.templateDetails.questionData.length > 0 ? false : true}
                                onClick={() => this.props.SaveCRFTemplate() }
                                >
                                Submit
                            </Button>
                            <Button bsStyle='warning' className='cancel-btn' onClick={() => this.props.CancelModal() }>
                                Cancel
                            </Button>
                        </div>
                    </div>
                    <Modal show={this.props.AddModalShow} onHide={this.props.AddModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Add Question</Modal.Title >
                        </Modal.Header>
                        <Modal.Body>
                            <FormGroup>
                                <ControlLabel className='required'>Question Text</ControlLabel>
                                <AsyncTypeahead onSearch={(search) => this.props.GetQuestionsList(search) } onBlur={(e) => this.props.HandleTextEdit(e) }
                                    labelKey={option => `${option.text}`} name='text'
                                    options={this.props.questionBank && this.props.questionBank.results ? this.props.questionBank.results : []}
                                    onChange={(e) => this.props.LoadQuestion(e) } placeholder='Enter Question Text' />
                            </FormGroup>
                            <div>
                                <FormGroup validationState={this.props.newQuestion && this.props.newQuestion.question_typeValidationState ? this.props.newQuestion.question_typeValidationState : null}>
                                    <ControlLabel className='required'>Question Type</ControlLabel>
                                    <FormControl name='question_type'
                                        value={this.props.newQuestion && this.props.newQuestion.question_type ? this.props.newQuestion.question_type : '0'} componentClass='select' placeholder='Select Question Type' id='questionType' onChange={this.props.HandleTextEdit}>
                                        <option key={0} value={0}>Select Question Type</option>
                                        {this.props.questionTypes.map((qt, i) => (
                                            <option key={i + 1} value={qt.value}>{qt.text}</option>
                                        )) }
                                    </FormControl>
                                    {this.props.newQuestion && this.props.newQuestion.question_typeHelp ? <HelpBlock className='error'>{this.props.newQuestion.question_typeHelp}</HelpBlock> : null}
                                </FormGroup>
                                {this.props.newQuestion && this.props.newQuestion.question_type && this.props.newQuestion.question_type != 'numeric' && this.props.newQuestion.question_type != 'text' && this.props.newQuestion.question_type != 'date' ?
                                    <FormGroup
                                        validationState={this.props.newQuestion && this.props.newQuestion.responsesValidationState ? this.props.newQuestion.responsesValidationState : null}>
                                        <ControlLabel className='required'>Responses</ControlLabel>
                                        <InputGroup>
                                            <FormControl type='text'
                                                name='responses'
                                                onChange={this.props.HandleTextEdit}
                                                value={this.props.responses ? this.props.responses : ''}
                                                autoComplete={'off'}
                                                />
                                            <InputGroup.Button>
                                                <Button className='add-btn-add-on' onClick={() => this.props.AddResponses('responses') }>Add</Button>
                                            </InputGroup.Button>
                                        </InputGroup>
                                        {this.props.newQuestion && this.props.newQuestion.responsesHelp ? <HelpBlock>{this.props.newQuestion.responsesHelp}</HelpBlock> : null}

                                        {this.props.newQuestion && this.props.newQuestion.responses ?
                                            this.props.newQuestion.responses.map((nq, i) => (
                                                <span key={i}><label>{nq}</label> <i className='fa fa-times' onClick={() => this.props.RemoveResponse(i, 'responses') }></i><br /></span>
                                            ))
                                            : null}
                                    </FormGroup> : null
                                }
                                {this.props.newQuestion && this.props.newQuestion.question_type == 'numeric' ?
                                    <div>
                                        <ControlLabel>Range</ControlLabel>
                                        <FormGroup className='range-response'
                                            validationState={this.props.newQuestion && this.props.newQuestion.responseMaxValue
                                                && this.props.newQuestion.responseMaxValueValidationState
                                                ? this.props.newQuestion.responseMaxValueValidationState : null}>
                                            <InputGroup>
                                                <FormControl type='number' step='0.0001' name='responseMinValue' placeholder='minimum value' onChange={this.props.HandleTextEdit}
                                                    defaultValue={this.props.newQuestion && this.props.newQuestion.responseMinValue ? this.props.newQuestion.responseMinValue : ''}>
                                                </FormControl>
                                                <FormControl type='number' step='0.0001' name='responseMaxValue' placeholder='maximum value' onChange={this.props.HandleTextEdit}
                                                    defaultValue={this.props.newQuestion && this.props.newQuestion.responseMaxValue ? this.props.newQuestion.responseMaxValue : ''}>
                                                </FormControl>
                                            </InputGroup>
                                            {this.props.newQuestion && this.props.newQuestion.responseMinValueHelp ?
                                                <HelpBlock className='error'>{this.props.selectedObject.responseMinValueHelp}</HelpBlock> : null}
                                            {this.props.newQuestion && this.props.newQuestion.responseMaxValueHelp ?
                                                <HelpBlock className='error'>{this.props.newQuestion.responseMaxValueHelp}</HelpBlock> : null}
                                        </FormGroup></div> : null
                                }
                                <FormGroup
                                    validationState={this.props.newQuestion && this.props.newQuestion.parent_questionValidationState ? this.props.newQuestion.parent_questionValidationState : null}>
                                    <ControlLabel>Parent Question ID</ControlLabel>
                                    <FormControl name='parent_question' componentClass='select' id='parentQuestion' onChange={this.props.HandleTextEdit}>
                                        <option key={0} value={0}>Select Parent Question</option>
                                        {this.props.parentIDList ? this.props.parentIDList.map((pi, i) => (
                                            <option key={i} value={pi}>{pi}</option>
                                        )) : null}
                                    </FormControl>
                                    {this.props.newQuestion && this.props.newQuestion.parent_questionHelp ? <HelpBlock>{this.props.newQuestion.parent_questionHelp}</HelpBlock> : null}
                                </FormGroup>
                                {this.props.newQuestion && this.props.newQuestion.parent_question ?
                                    <div>
                                        <FormGroup
                                            validationState={this.props.newQuestion && this.props.newQuestion.parent_conditionValidationState ? this.props.newQuestion.parent_conditionValidationState : null}
                                            >
                                            <ControlLabel>Parent Condition</ControlLabel>
                                            <FormControl name='parent_condition' componentClass='select' placeholder='Select Question Type' id='questionType' onChange={this.props.HandleTextEdit}>
                                                <option key={0} value={0}>Select Parent Condition</option>
                                                {this.props.parentConditionTypes.map((pr, i) => (
                                                    <option key={i} value={pr.value}>{pr.text}</option>
                                                )) }
                                            </FormControl>
                                            {this.props.newQuestion && this.props.newQuestion.parent_conditionHelp ? <HelpBlock>{this.props.newQuestion.parent_conditionHelp}</HelpBlock> : null}
                                        </FormGroup>
                                        <FormGroup
                                            validationState={this.props.newQuestion && this.props.newQuestion.parent_responseValidationState
                                                && this.props.newQuestion.parent_responseValidationState
                                                ? this.props.newQuestion.parent_responseValidationState : null}>
                                            <ControlLabel>Parent Response</ControlLabel>
                                            <InputGroup>
                                                <FormControl type='text'
                                                    name='parent_response'
                                                    onChange={this.props.HandleTextEdit}
                                                    value={this.props.parent_response ? this.props.parent_response : ''}
                                                    />
                                                <InputGroup.Button>
                                                    <Button className='add-btn-add-on' onClick={() => this.props.AddResponses('parent_response') }>Add</Button>
                                                </InputGroup.Button>
                                            </InputGroup>
                                            {this.props.newQuestion && this.props.newQuestion.parent_response ?
                                                this.props.newQuestion.parent_response.map((nq, i) => (
                                                    <span key={i}><label>{nq}</label> <i className='fa fa-times' onClick={() => this.props.RemoveResponse(i, 'parent_response') }></i><br /></span>
                                                ))
                                                : null}
                                            {this.props.newQuestion && this.props.newQuestion.parent_responseHelp ? <HelpBlock>{this.props.newQuestion.parent_responseHelp}</HelpBlock> : null}

                                        </FormGroup>
                                    </div>
                                    : null
                                }
                                <FormGroup>
                                    <ControlLabel>Note</ControlLabel>
                                    <FormControl componentClass='textarea' name='note' maxLength='250' onChange={this.props.HandleTextEdit} />
                                    <HelpBlock>Maximum length of 'Note' is 250 characters</HelpBlock>
                                </FormGroup></div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button bsStyle='success' onClick={() => this.props.AddQuestion() }
                                disabled={this.props.newQuestion
                                    && this.props.newQuestion.text
                                    ? false : true}>Add</Button>
                        </Modal.Footer>
                    </Modal>

                </div>
            </div>
        )
    }
}

export default ManageCaseReportForm
