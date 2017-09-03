import React, {Component} from 'react';
import {Button} from 'react-bootstrap';

export default class ConfirmEmailSent extends Component {
  render() {
    return (
      <div >
        <h4 className='text-info'>Password reset link sent successfully</h4>
        <div className="row">
          <div className="col-md-12">
            Check your email for a link to reset your 
            password. 
          </div>
        </div>
        <br />
        <div className="row">
          <div className="col-md-12">
            <Button bsStyle='success' onClick={() => this.props.RedirectToLogin()}>Log in</Button>
          </div>
          </div>
      </div>
    )
  }
}