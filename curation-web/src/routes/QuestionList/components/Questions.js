import React, { Component } from 'react'
import {Button, InputGroup, Modal, DropdownButton, MenuItem, FormControl, ControlLabel, FormGroup, HelpBlock} from 'react-bootstrap'
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import FieldGroup from '../../../components/FieldGroup';
import './questionStyles.scss'


class Questions extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.LoadQuestionsData(1, 10)
    }
    render() {
        var createCustomAddButton = () => {
            return (
                <Button onClick={() => this.props.toggleModal() } bsStyle='primary'>
                    <i className='fa fa-plus' aria-hidden='true'></i> Add Question
                </Button>
            )
        }
        var typeCell = (cell, row) => {
            let val = cell[0].charAt(0).toUpperCase() + cell.slice(1)
            return (
                <span className='file-data' title={cell}>{val}</span>
            )
        }
        var customSearchField = () => {
            return (
                <InputGroup className='search-questions'>
                    <input type='text' placeholder='Search Questions' onChange={(e) => this.props.SearchQuestion(e) } className='form-control'/>
                    <InputGroup.Addon><i className='fa fa-search'></i></InputGroup.Addon>
                </InputGroup>
            );
        }
        var tableCell = (cell, row) => {
            return (
                <span className='ques-data' title={cell}>{cell}</span>
            )
        }

        var options = {
            btnGroup: createCustomAddButton,
            onPageChange: this.props.PageChanged,
            paginationShowsTotal: true,
            page: this.props.page,
            searchField: customSearchField,
            sizePerPageList: [{
                    text: '10', value: 10
                },
                {
                    text: '25', value: 25
                },
                {
                    text: '50', value: 50
                }],
            onSortChange: this.props.SortChange
        };

        var activeFormatter = (cell, row) => {
            return (
                <div>
                    <span>
                        <span className='edit-button'>
                            <Button bsStyle='primary' onClick={() => this.props.toggleModal(row.id) } title={'Edit Question'}>
                                <i className='fa fa-pencil-square-o' aria-hidden='true'></i>
                            </Button>
                        </span>
                        <span className='delete-button'>
                            <Button bsStyle='danger' onClick={() => this.props.toggleModal(row.id, 'delete') } title={'Delete Question'}>
                                <i className='fa fa-trash-o' aria-hidden='true'></i>
                            </Button>
                        </span>
                    </span>
                </div>
            );
        }

        return (
            <div>
                <div className='questions-container'>
                    <div className='container'>
                        <BootstrapTable
                            data={ this.props.questions ? this.props.questions.results : []}
                            pagination={true}
                            striped={true}
                            hover={true}
                            fetchInfo={{
                                dataTotalSize: this.props.totalCount
                            }}
                            search={true}
                            options={ options }
                            remote>
                            <TableHeaderColumn dataFormat={tableCell} dataField='text' dataSort={true} isKey={true}>Question Text</TableHeaderColumn>
                            <TableHeaderColumn dataFormat={typeCell} dataField='type' dataSort={true}>Question Type</TableHeaderColumn>
                            <TableHeaderColumn dataFormat={tableCell} dataField='description' dataSort={true}>Description</TableHeaderColumn>
                            <TableHeaderColumn dataFormat={tableCell} dataField='responses' dataSort={true}>Responses</TableHeaderColumn>
                            <TableHeaderColumn dataFormat={activeFormatter}>Actions</TableHeaderColumn>
                        </BootstrapTable>
                    </div>
                </div>
                {this.props && this.props.showAddModal && !this.props.isDeletable ?
                    <Modal show={this.props.showAddModal} onHide={this.props.toggleModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>{!this.props.selectedObject ? 'Add Question' : 'Edit Question'}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <form>
                                <FieldGroup
                                    type='text'
                                    name='text'
                                    isRequired={true}
                                    onChange={this.props.handleEditEvent}
                                    autoComplete={'off'}
                                    validationState={this.props.selectedObject && this.props.selectedObject.text
                                        ? this.props.selectedObject.text.validationState
                                        : (this.props.newQuestion && this.props.newQuestion.text ? this.props.newQuestion.text.validationState : null) }
                                    help = {this.props.selectedObject && this.props.selectedObject.text ? this.props.selectedObject.text.help :
                                        (this.props.newQuestion && this.props.newQuestion.text ? this.props.newQuestion.text.help : null) }
                                    label='Question Text'
                                    defaultValue={this.props.selectedObject && this.props.selectedObject.text
                                        ? this.props.selectedObject.text.value
                                        : ''}/>

                                <FormGroup validationState={this.props.selectedObject && this.props.selectedObject.description
                                    ? this.props.selectedObject.description.validationState
                                    : (this.props.newQuestion && this.props.newQuestion.description
                                        ? this.props.newQuestion.description.validationState : null) }>
                                    <ControlLabel className='required'>Description</ControlLabel>
                                    <FormControl name='type' name='description' componentClass='textarea'
                                        defaultValue={this.props.selectedObject && this.props.selectedObject.description
                                            ? this.props.selectedObject.description.value
                                            : ''}
                                        autoComplete={'off'}
                                        onChange={this.props.handleEditEvent}>
                                    </FormControl>
                                    {this.props.selectedObject && this.props.selectedObject.description && this.props.selectedObject.description.help ?
                                        <HelpBlock>{this.props.selectedObject.description.help}</HelpBlock>
                                        : (this.props.newQuestion && this.props.newQuestion.description && this.props.newQuestion.description.help ?
                                            <HelpBlock>{this.props.newQuestion.description.help}</HelpBlock> : null) }
                                </FormGroup>

                                {this.props && this.props.questionTypes ?
                                    <div>
                                        <FormGroup validationState={this.props.selectedObject && this.props.selectedObject.type
                                            ? this.props.selectedObject.type.validationState
                                            : (this.props.newQuestion && this.props.newQuestion.type
                                                ? this.props.newQuestion.type.validationState : null) }>
                                            <ControlLabel className='required'>Question Type</ControlLabel>
                                            <FormControl name='type' componentClass='select'
                                                defaultValue={this.props.selectedObject && this.props.selectedObject.type ? this.props.selectedObject.type.value : ''}
                                                id='QuestionType' onChange={this.props.handleEditEvent}>
                                                <option key={0} value={0}>Select Question type </option>
                                                {this.props.questionTypes.map((qt, i) => (
                                                    <option key={i} value={qt.value}>{qt.label}</option>
                                                )) }
                                            </FormControl>
                                            {this.props.selectedObject && this.props.selectedObject.type ? <HelpBlock>{this.props.selectedObject.type.help}</HelpBlock>
                                                : (this.props.newQuestion && this.props.newQuestion.type ? <HelpBlock>{this.props.newQuestion.type.help}</HelpBlock> : null) }
                                        </FormGroup>
                                    </div> : null
                                }
                                <div className='options-adding-div'>
                                    {this.props.showOptions ?
                                        <div>
                                            {((this.props.selectedObject && this.props.selectedObject.type && this.props.selectedObject.type.value == 'numeric') ||
                                                (this.props.newQuestion && this.props.newQuestion.type && this.props.newQuestion.type.value == 'numeric')) ?
                                                <div>
                                                    <ControlLabel>Range</ControlLabel>
                                                    <FormGroup className='range-response'
                                                        validationState={this.props.selectedObject && this.props.selectedObject.responseMaxValue
                                                            && this.props.selectedObject.responseMaxValue.validationState
                                                            ? this.props.selectedObject.responseMaxValue.validationState : null}>
                                                        <InputGroup>
                                                            <FormControl type='number' step='0.0001' name='responseMinValue' placeholder='minimum value' onChange={this.props.handleEditEvent}
                                                                defaultValue={this.props.selectedObject && this.props.selectedObject.responseMinValue ? this.props.selectedObject.responseMinValue.value : ''}>
                                                            </FormControl>
                                                            <FormControl type='number' step='0.0001' name='responseMaxValue' placeholder='maximum value' onChange={this.props.handleEditEvent}
                                                                defaultValue={this.props.selectedObject && this.props.selectedObject.responseMaxValue ? this.props.selectedObject.responseMaxValue.value : ''}>
                                                            </FormControl>
                                                        </InputGroup>
                                                        {this.props.selectedObject && this.props.selectedObject.responseMinValue && this.props.selectedObject.responseMinValue.validationState == 'error' ?
                                                            <HelpBlock className='error'>{this.props.selectedObject.responseMinValue.help}</HelpBlock> : null}
                                                        {this.props.selectedObject && this.props.selectedObject.responseMaxValue && this.props.selectedObject.responseMaxValue.validationState == 'error' ?
                                                            <HelpBlock className='error'>{this.props.selectedObject.responseMaxValue.help}</HelpBlock> : null}
                                                    </FormGroup>
                                                </div>
                                                :
                                                <FormGroup validationState={this.props.selectedObject && this.props.selectedObject.responses
                                                    ? this.props.selectedObject.responses.validationState
                                                    : (this.props.newQuestion && this.props.newQuestion.responses
                                                        ? this.props.newQuestion.responses.validationState : null) }>
                                                    <ControlLabel className='required'>Responses</ControlLabel>
                                                    <InputGroup>
                                                        <FormControl type='text'
                                                            name='responses'
                                                            onChange={this.props.handleEditEvent}
                                                            autoComplete={'off'}
                                                            value={this.props.responses ? this.props.responses : ''}
                                                            />
                                                        <InputGroup.Button>
                                                            <Button className='add-btn-add-on' onClick={() => this.props.OptionAdded() }>Add</Button>
                                                        </InputGroup.Button>
                                                    </InputGroup>
                                                </FormGroup>
                                            }
                                            {this.props.selectedObject && this.props.selectedObject.responses && this.props.selectedObject.responses.help ?
                                                <HelpBlock className='error'>{this.props.selectedObject.responses.help}</HelpBlock> : null}
                                            {this.props.newQuestion && this.props.newQuestion.responses && this.props.newQuestion.responses.help ?
                                                <HelpBlock className='error'>{this.props.newQuestion.responses.help}</HelpBlock> : null}
                                        </div>
                                        : null
                                    }
                                </div>
                                <div className='question-options'>
                                    {this.props.selectedObject && this.props.selectedObject && this.props.selectedObject.responses && this.props.selectedObject.responses.value ?
                                        this.props.selectedObject.responses.value.map((res, i) => (
                                            <span key={i}><label>{res}</label><i className='fa fa-trash-o' onClick={() => this.props.RemoveOption(i) }></i><br/></span>
                                        )) : null
                                    }

                                    {!this.props.selectedObject && this.props.newQuestion && this.props.newQuestion.responses && this.props.newQuestion.responses.value ?
                                        this.props.newQuestion.responses.value.map((qo, i) => (
                                            <span key={i}><label>{qo}</label><i className='fa fa-trash-o' onClick={() => this.props.RemoveOption(i) }></i><br/></span>
                                        )) : null
                                    }
                                </div>
                            </form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button bsStyle='success' onClick={() => this.props.SaveQuestion() }>Submit</Button>
                        </Modal.Footer>
                    </Modal> : null
                }
                {this.props && this.props.showAddModal && this.props.isDeletable ?
                    <Modal dialogClassName="modal-sm" show={this.props.showAddModal} onHide={this.props.toggleModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Delete Question</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Are you sure want to Delete this Question?</Modal.Body>
                        <Modal.Footer>
                            <Button bsStyle='primary' onClick={() => this.props.SaveQuestion() }>Ok</Button>
                        </Modal.Footer>
                    </Modal> : null}
            </div>
        )
    }
}

export default Questions
