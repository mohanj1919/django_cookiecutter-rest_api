import React, { Component } from 'react';
import '../../../../scss/style.scss'
import './style.scss'

import {Button, Modal, FormGroup, ControlLabel, FormControl, HelpBlock, ButtonToolbar, InputGroup, ToggleButtonGroup, ToggleButton} from 'react-bootstrap';
import FieldGroup from '../../../components/FieldGroup';
import FontAwesome from 'react-fontawesome';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import rrui from 'react-phone-number-input/rrui.css'
import rpni from 'react-phone-number-input/style.css'
import Phone from 'react-phone-number-input'
import _ from 'lodash'

class UsersList extends Component {

  componentDidMount() {
    this.props.fetchUsers(); 
  }
  render() {
    var activeFormatter = (cell, row) => {
      return (
        <div>
          <Button bsStyle='primary' onClick={() => this.props.EditUserList(row.id) } title={'Edit User'}>
            <i className='fa fa-pencil-square-o' aria-hidden="true"></i>
          </Button>
          &nbsp;
          <Button bsStyle='danger' onClick={() => this.props.DeleteUser(row.id) } title={'Delete User'}>
            <i className="fa fa-trash-o" aria-hidden="true"></i>
          </Button>
          &nbsp;
          <Button bsStyle='primary' onClick={() => this.props.ResetUserPassword(row.email) } title={'Reset User Password'}>
            <i className="fa fa-share-square-o" aria-hidden="true"></i>
          </Button>
        </div>
      );
    }

    var displayRole = (cell, row) => {
      return (
        // <div className='user-role-grid'>{row.groups.length ? row.groups[0].name : '-'}</div>
        <span className='user-role-grid'>{row.groups.length? row.groups[0].name:'-'}</span >
      )
    }

    var tableCell = (cell, row) => {
      if (cell) {
        return (
          <span className='user-data' title={cell}>{cell}</span>
        )
      } else {
        return (
          <div className='no-data-found'>
            <span className='user-data' title={cell}>-</span>
          </div >
        )
      }
    }
    var mfa_type_tableCell = (cell, row) => {
      if (cell) {
        let cellValue = (cell == 'sms') ? cell.toUpperCase() : cell.charAt(0).toUpperCase() + cell.slice(1)
        return (
          <span className='user-data' title={cellValue}>{cellValue}</span>
        )
      }
      else {
        return (
          <span className='user-data' title={cell}>N/A</span>
        )
      }
    }

    var createCustomButtonGroup = () => {
      return (
        <Button onClick={this.props.toggleModal} bsStyle='primary'>
          <i className="fa fa-plus" aria-hidden="true"></i>&nbsp; Add User
        </Button>
      )
    }
    var userStatusSwitch = (cell, row) => {
      return (
        <span>
          {row.is_active?'Active':'In Active'}
        </span>
      )
    }
    var customSearchField = (props) => {
      return (
          <InputGroup className='search-questions table-search-box'>
              <input type='text' placeholder='Search users' onKeyUp={this.props.SearchUser} className='form-control' />
              <InputGroup.Addon><i className="fa fa-search"></i></InputGroup.Addon>
          </InputGroup>
      );
    }
    var options = {
      onPageChange: this.props.PageChange,
      page: this.props.pageNumber,
      btnGroup: createCustomButtonGroup,
      paginationShowsTotal: true,
      searchField: () => customSearchField(),
      sizePerPageList: [{
        text: '10', value: 10
      }
        , {
          text: '25', value: 25
        },
        {
          text: '50', value: 50
        }],
      onSortChange: this.props.SortChange
    };

    return (
      <div className='container users-list'>
        <br />
        {this.props && this.props.users
          ? <BootstrapTable 
            data={this.props.users}
            striped={true}
            hover={true}
            search={true}
            className={'users-table'}
            fetchInfo={{
              dataTotalSize: this.props.totalCount
            }}
            options={options}
            pagination
            remote>
            <TableHeaderColumn dataFormat={tableCell} dataField="first_name" dataSort={true}>First Name</TableHeaderColumn>
            <TableHeaderColumn dataFormat={tableCell} dataField="last_name" dataSort={true}>Last Name</TableHeaderColumn>
            <TableHeaderColumn dataFormat={tableCell} dataField="email" isKey={true} dataSort={true}>Email</TableHeaderColumn>
            <TableHeaderColumn dataFormat={tableCell} dataField="phone_number" dataSort={true}>Mobile number</TableHeaderColumn>
            <TableHeaderColumn dataFormat={displayRole} dataField={'groups__name'} dataSort={true}>Role</TableHeaderColumn>
            <TableHeaderColumn dataFormat={userStatusSwitch} dataSort={true}>Status</TableHeaderColumn>
            <TableHeaderColumn dataFormat={mfa_type_tableCell} dataField="mfa_type" dataSort={true}>MFA type</TableHeaderColumn>
            <TableHeaderColumn dataFormat={activeFormatter}>Actions</TableHeaderColumn>
          </BootstrapTable>
          : <h2 className='text-info'>No users to display</h2>}

        <Modal dialogClassName="modal-sm" className='normal-modal' show={this.props.showResetModal} onHide={this.props.toggleEmailReset}>
          <Modal.Header closeButton>
            <Modal.Title>Reset Password</Modal.Title > </Modal.Header>
          <Modal.Body><div className='banner-modal-message'> Do you want to send reset password link to "{this.props.userResetEmail}" ? </div> </Modal.Body>
          < Modal.Footer > <Button type='submit' bsStyle='primary' onClick={() => this.props.ConfirmResetUserPassword() }>
            Reset Password
          </Button> </Modal.Footer>
        </Modal >

        {!this.props.isDelete
          ? (
            <Modal show={this.props.showModal} onHide={this.props.toggleModal}>
              <Modal.Header closeButton>
                <Modal.Title>{!this.props.selectedObject.id
                  ? 'Add User'
                  : 'Edit User'}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div>
                  <form>
                    <FieldGroup
                      type='text'
                      name='first_name'
                      onChange={this.props.handleEditEvent}
                      autoComplete={'off'}
                      isRequired={true}
                      validationState={this.props.selectedObject
                        ? this.props.selectedObject.first_nameValidationState
                        : null}
                      help={this.props.selectedObject.first_nameHelp}
                      label='First Name'
                      defaultValue={this.props.selectedObject
                        ? this.props.selectedObject.first_name
                        : ''} />

                    <FieldGroup
                      type='text'
                      name='last_name'
                      onChange={this.props.handleEditEvent}
                      help={this.props.selectedObject.last_nameHelp}
                      autoComplete={'off'}
                      isRequired={true}
                      validationState={this.props.selectedObject
                        ? this.props.selectedObject.last_nameValidationState
                        : null}
                      label='Last Name'
                      defaultValue={this.props.selectedObject
                        ? this.props.selectedObject.last_name
                        : ''} />

                    <FieldGroup
                      type='text'
                      name='email'
                      onChange={this.props.handleEditEvent}
                      help={this.props.selectedObject.emailHelp}
                      autoComplete={'off'}
                      isRequired={true}
                      readOnly={this.props.selectedObject.id ? 'readonly' : ''}
                      validationState={this.props.selectedObject
                        ? this.props.selectedObject.emailValidationState
                        : null}
                      label='Email address'
                      defaultValue={this.props.selectedObject
                        ? this.props.selectedObject.email
                        : ''} />
                    <FormGroup
                      validationState={this.props.selectedObject
                        ? this.props.selectedObject.roleValidationState
                        : null}>
                      <ControlLabel className='required'>Role</ControlLabel>
                      <FormControl
                        className='user-roles'
                        componentClass='select'
                        onChange={this.props.handleEditEvent}
                        placeholder='select'
                        defaultValue={this.props.selectedObject.groups
                          && this.props.selectedObject.groups[0] ? this.props.selectedObject.groups[0].id
                          : 0}
                        name='role'>
                        <option value={0}>
                          select</option>
                        {this.props.allRoles && this.props.allRoles.length > 0
                          ? this
                            .props
                            .allRoles
                            .map((ar) => (
                              <option value={ar.id} key={ar.id}>{ar.name}</option>
                            ))
                          : null}}
                      </FormControl>
                    </FormGroup>

                    {this.props.mfaTypes && this.props.mfaTypes.length > 0 ?
                      <FormGroup validationState={this.props.selectedObject
                        ? this.props.selectedObject.mfa_typeValidationState
                        : null}>
                        <ControlLabel className='required'>Multi-factor Authentication Type</ControlLabel>
                        <FormControl componentClass="select" placeholder="Select MFA type" name="mfa_type" onChange={this.props.handleEditEvent}
                          defaultValue={this.props.selectedObject ? this.props.selectedObject.mfa_type : ''}>
                          <option key={0} value={0}>Select MFA Type</option>
                          {this.props.mfaTypes.map((mf, i) => (
                            <option value={mf.key} key={i}>{mf.value}</option>
                          )) }
                        </FormControl>
                        {this.props.selectedObject && this.props.selectedObject.mfa_typeHelp ? <HelpBlock>{this.props.selectedObject.mfa_typeHelp}</HelpBlock> : null}
                      </FormGroup> : null
                    }
                    <FormGroup validationState={this.props.selectedObject
                      ? this.props.selectedObject.phone_numberValidationState
                      : null}>
                      <ControlLabel>Mobile Number</ControlLabel>
                      <Phone
                        className='form-control'
                        autoComplete={'off'}
                        placeholder="Enter User's Mobile number"
                        onChange={this.props.MobileNumberChanged}
                        value={this.props.selectedObject ? this.props.selectedObject.phone_number : ''}
                        name='phone_number'/>
                      {this.props.selectedObject && this.props.selectedObject.phone_numberHelp ? <HelpBlock>{this.props.selectedObject.phone_numberHelp}</HelpBlock> : null}
                    </FormGroup>
                    {this.props.selectedObject.id?
                    <FormGroup>
                      <ControlLabel>Status</ControlLabel>
                       <ButtonToolbar>
                            <ToggleButtonGroup type="radio" name="options" defaultValue={this.props.selectedObject.is_account_locked}
                                 onChange={(e)=>this.props.toggleActive(e)}>
                                <ToggleButton value={false}>Active</ToggleButton>
                                <ToggleButton value={true}>InActive</ToggleButton>
                            </ToggleButtonGroup>  
                        </ButtonToolbar>
                    </FormGroup>:null}

                  </form>
                  <div className="text-danger">{this.props.error}</div>
                </div> </Modal.Body>
              <Modal.Footer>
                <Button type='submit' bsStyle='primary' onClick={() => this.props.SaveUser() }>
                  {!this.props.selectedObject.id ? 'Register' : 'Save'}
                </Button > </Modal.Footer> </Modal>) :
          (
            <Modal dialogClassName="modal-sm" className='normal-modal' show={this.props.showModal} onHide={this.props.toggleModal}>
              <Modal.Header closeButton>
                <Modal.Title>Delete User</Modal.Title > </Modal.Header> < Modal.Body > Are you Sure to Delete user < label > {
                  this.props.selectedObject
                    ? this.props.selectedObject.username
                    : null
                } </label> with  <label>{this.props.selectedObject ? "email " + this.props.selectedObject.email : null}</label > </Modal.Body> < Modal.Footer > <Button type='submit' bsStyle='danger' onClick={() => this.props.DeleteUser() }>
                  Delete
                </Button> </Modal.Footer>
            </Modal >)
        } </div>

    );
  }
}

export default UsersList;
