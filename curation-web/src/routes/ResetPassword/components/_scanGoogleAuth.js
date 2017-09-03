import React, {Component} from 'react'
import {FormGroup, ControlLabel, FormControl, Button} from 'react-bootstrap'
import FieldGroup from '../../../components/FieldGroup';
import QRCode from 'qrcode.react'

export default class ScanGoogleAuth extends Component {
    render() {
        return (
            <div className='qr-div'>
                <h3>Password set successfully !</h3>
                {this.props.clientProvisioningURI?<div>
                <h5>Scan following QR Code</h5>
                <div className='qr-code'>
                    <QRCode value={this.props.clientProvisioningURI}/>
                </div>
                </div>:null}
                <div className="row submit-btn">
                    <div className="col-md-12">
                        <Button bsStyle="success" onClick={() => this.props.RedirectToLogin()}>Log In</Button>
                    </div>
                </div>
                {this.props.clientProvisioningURI?
                <div className="row">
                    <div className="col-md-12">
                        <h5 className='text-info download-app-help'>* Download Google Authenticator from Apple App Store or Google Play Store</h5>
                    </div>
                </div>:null
                }
            </div>
        )
    }
}
