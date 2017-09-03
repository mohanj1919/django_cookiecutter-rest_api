import React, {Component} from 'react';
import {FormGroup, ControlLabel, FormControl, Button, HelpBlock} from 'react-bootstrap';
import FieldGroup from '../../../components/FieldGroup';

export default class AuthOne extends Component {
  render() {
    return (
      <div>
        <h3 className='text-h3-padding'>Login</h3>
        <form onSubmit={(evt) => { this.props.LogIn(); evt.preventDefault(); } }>
          <FieldGroup
            id="formControlsEmail"
            type="text"
            label="Email address"
            value={this.props.username.value}
            name={'username'}
            onChange={this.props.handleEvent}
            validationState = {this.props.username.validationState}
            help = {this.props.username.helpBlockText}
            autoFocus/>
          <FieldGroup
            id="formControlsPassword"
            label="Password"
            type="password"
            value={this.props.password.value}
            name={'password'}
            validationState = {this.props.password.validationState}
            help = {this.props.password.helpBlockText}
            onChange={this.props.handleEvent}/>
          {this.props.InvalidLoginMessage ? <HelpBlock className='error'>{this.props.InvalidLoginMessage}</HelpBlock> : null}
          <div className="row">
            <div className="col-md-6">
              <Button type='submit' bsStyle="primary">Next</Button>
            </div>
            <div className="col-md-6 text-right">
              <Button bsStyle="link" onClick={() => this.props.ForgotPassword() }>Forgot password?</Button>
            </div>
          </div>
        </form>
      </div>
    )
  }
}