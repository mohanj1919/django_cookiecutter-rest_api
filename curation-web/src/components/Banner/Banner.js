import React from 'react';
import {Button, Modal} from 'react-bootstrap';
import '../../../scss/style.scss';
const successStyle = {
    backgroundColor: '#5cb85c'
}
const errorStyle = {
    backgroundColor: '#d9534f'
}
const warningStyle = {
    backgroundColor: '#f0ad4e'
}
const defaultStyle = {
    backgroundColor: '#5bc0de'
}
export class Banner extends React.Component {
    callSetTimeOut() {
        this.props.bannerHide();
    }
    componentDidMount() {
        if (this.props.time) {
            setTimeout(() => {
                this.callSetTimeOut();
            }, this.props.time);
        }
    }
    render() {
        return (
            <div>
                {this.props.successCb ? <Modal show={true} dialogClassName="modal-sm" onHide={this.props.cancelCb}>
                    <Modal.Header closeButton>
                        <Modal.Title>{this.props.messageTitle}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className='banner-modal-message'>
                            { this.props.message }
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button bsStyle='success' bsSize='small' onClick={this.props.successCb}>{this.props.confirmText?this.props.confirmText:'OK'}</Button>
                        <Button bsStyle='warning' bsSize='small' onClick={this.props.cancelCb}>Cancel</Button>
                    </Modal.Footer>
                </Modal> :
                    <div id='note' className="container-fluid" style = {this.props.type == 'success' ? successStyle : (this.props.type == 'error' ? errorStyle : (this.props.type == 'warning' ? warningStyle : defaultStyle)) }>
                        <div className="container">
                            <div className="row">
                                <div className="col-md-6">
                                    { this.props.message }
                                </div>
                                <div className="col-md-1 banner-close-div"><span className='banner-close' onClick={this.props.bannerHide}><i className="fa fa-times" aria-hidden="true"></i></span></div>
                            </div>
                        </div>
                    </div>
                }
            </div>

        )
    }
}
export default Banner