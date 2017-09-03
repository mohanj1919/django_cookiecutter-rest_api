import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {FormGroup, ControlLabel, FormControl, Button} from 'react-bootstrap';
import FieldGroup from '../../../components/FieldGroup';

export default class GoogleAuth extends Component {

    render() {
        return (
            <div >
                <form onSubmit={(evt) => {this.props.Authenticate(); evt.preventDefault();}}>
                    <h4 className="text-info">Hi, {this.props.username.value}</h4>
                    <FieldGroup
                        id="formControlsOTP"
                        label= {this.props.OTPLabel}
                        type="text"
                        value={this.props.authCode.value}
                        help={this.props.authCode.helpBlockText}
                        validationState={this.props.authCode.validationState}
                        name={'authCode'}
                        onChange={this.props.handleEvent}
                        autoComplete = {'off'}
                        autoFocus/>
                    <div className="row">
                        <div className="col-md-6">
                            <Button bsStyle="success" type='submit'>Sign In</Button>
                        </div>
                        {this.props.show_resend_link?
                        <div className="col-md-6">
                            <Button bsStyle="link" className={'pull-right'} onClick={this.props.LogIn}>Resend OTP</Button>
                        </div>:null}
                    </div>
                </form>
            </div>
        )
    }
}
