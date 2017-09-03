import React, {Component} from 'react';
import {Typeahead} from 'react-bootstrap-typeahead'
import {Button, InputGroup, FormGroup, ControlLabel, Popover} from 'react-bootstrap';
import FieldGroup from '../../../../../components/FieldGroup';
import './style.scss';

class Profile extends Component {
    componentDidMount() {
    this.props.GetUserDetails();
  }

  render() {
    return (
      <div className='container'>
        <h4>Edit Profile</h4>
        <hr/>
        <div className="row cohort-configure">
          <div className="col-md-6">
            <div>
              <label>User Details</label>
              <div className="well">
                <FieldGroup
                  type='text'
                  name='first_name'
                  value={this.props.first_name}
                  onChange={this.props.handleEvent}
                  autoComplete={'off'}
                  help = {this.props.firstNameValidationState ? 'Invalid Field Value' : null}
                  validationState = {this.props.firstNameValidationState}
                  label='First Name'
                  autoFocus/>

               <FieldGroup
                  type='text'
                  name='last_name'
                  value={this.props.last_name}
                  onChange={this.props.handleEvent}
                  autoComplete={'off'}
                  help = {this.props.lastNameValidationState ? 'Invalid Field Value' : null}
                  validationState = {this.props.lastNameValidationState}
                  label='Last Name'/>

              <FieldGroup
                  type='email'
                  autoComplete={'off'}
                  readOnly={'readonly'}
                  label='Email address'
                  value={this.props.email} />

               <FieldGroup
                  type='text'
                  autoComplete={'off'}
                  readOnly={'readonly'}
                  label='Mobile Number'
                  value={this.props.phone_number} />
              </div>

              <label>Change Password</label>
              <div className="well">

                <FieldGroup
            label="Current Password"
            type="password"
            value={this.props.currentpassword}
            name={'currentpassword'}
            onChange={this.props.handleEvent}
            help = {this.props.passwordValidationState?'Invalid password': null}
            validationState = {this.props.passwordValidationState}
            />

            <FieldGroup
            id="formControlsPassword"
            label="New Password"
            type="password"
            value={this.props.password}
            validationState = {this.props.newPasswordValidationState?'error':null}
            help = {this.props.newPasswordValidationState}
            name={'password'}
            onChange={this.props.handleEvent}
            />
          <Popover id="tooltip" placement='right' className='always-show-profile'>
              {this.props.passwordValidations.map((item, index)=>
              <span key={index}>
                <h5><span className={item.class}><i className={item.icon}></i></span>&nbsp;{item.message}</h5>
            </span>
            )}
          </Popover>
          <FieldGroup
            id="formControlsConfirmPassword"
            label="Confirm Password"
            type="password"
            value={this.props.confirmPassword}
            name={'confirmPassword'}
            onChange={this.props.handleEvent}/>

          <div className="text-danger form-password-validation">{this.props.error}</div>
              </div>
              <Button bsStyle='success' onClick={this.props.submitFormFunction} className='pull-left'>Save</Button>
              <Button bsStyle='link' className='pull-right' onClick={this.props.CancelUpdate}>Cancel</Button>
            </div>

          </div>
        </div>
      </div>
    );
  }
}
export default Profile;
