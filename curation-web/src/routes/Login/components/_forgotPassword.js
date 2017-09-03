import React, {Component} from 'react';
import {Button} from 'react-bootstrap';
import FieldGroup from '../../../components/FieldGroup';

export default class ForgotPassword extends Component {
  render() {
    return (
      <div >
        <h3>Forgot Password</h3>
        <form onSubmit={(evt) => {this.props.SendForgotPasswordLink(); evt.preventDefault();}}>
          <FieldGroup
            type="text"
            label="Email address"
            value={this.props.username.value}
            name={'username'}
            onChange={this.props.handleEvent}
            validationState = {this.props.username.validationState}
            help = {this.props.username.helpBlockText}
            autoFocus/>
          <div className="row">
            <div className="col-md-6">
              <Button type='submit' bsStyle="primary">Send email link</Button>
            </div>
          </div>
        </form>
      </div>
    )
  }
}