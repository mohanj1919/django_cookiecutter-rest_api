import React, {Component} from 'react'
import {FormGroup, ControlLabel, FormControl, Button, OverlayTrigger, Popover} from 'react-bootstrap'
import FieldGroup from '../../../components/FieldGroup';

export default class PasswordResetForm extends Component {
  render() {
    return (
      <div>
        <h3>Set Password</h3>
        <form>

          <FieldGroup
            id="formControlsPassword"
            label="Password"
            type="password"
            value={this.props.password}
            name={'password'}
            help = {this.props.passwordValidationState}
            validationState = {this.props.passwordValidationState?'error': null}
            onChange={this.props.handleEvent}
            autoFocus/>
          <Popover id="tooltip" placement='right' className='always-show-reset-form'>
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

          <div className="row">
            <div className="col-md-6">
                <Button bsStyle="warning"
                onClick={() => this.props.ResetPasswordSuccess()}>Submit</Button>
            </div>
          </div>
        </form>
      </div>
    )
  }
}
