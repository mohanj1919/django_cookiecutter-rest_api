import React, { Component } from 'react'
import { Button, MenuItem, FormControl, ControlLabel, FormGroup, HelpBlock } from 'react-bootstrap'
import ReactQuill from 'react-quill'
import './EmailTemplateDesignerStyles.scss'
import theme from 'react-quill/dist/quill.snow.css';
import _ from 'lodash'


class EmailTemplateDesigner extends Component {
  componentDidMount() {
    this.props.GetTemplateDetails()
  }
  render() {
    let subject = this.props.selectedTemplateData ? this.props.selectedTemplateData.subject : ''
    return (
      <div className='container template-designer'>
        {this.props.templateData && this.props.templateData.length ? <div className='row'> <div className='template-name col-lg-4 col-md-4'>
          <ControlLabel>Select Template : </ControlLabel>
          <FormControl name='templatename' componentClass='select' value={this.props.selectedTemplateData ? this.props.selectedTemplateData.id : null} onChange={this.props.TemplateSelected}>
            {this.props.templateData ? this.props.templateData.map((dt, k) => (
              <option key={k} value={dt.id}>{dt.display_name}</option>
            )) : null }
          </FormControl>
        </div></div> : null}
        {this.props.selectedTemplateData ?
          <div className='row template-div col-lg-12 col-md-12'>
            <div className='subject-div'>
              {Object.keys(this.props.selectedTemplateData).indexOf('subject') > -1 ? <ControlLabel>Subject : </ControlLabel> : null}
              <FormControl type='text' name='subject' value={subject} onChange={this.props.SubjectChanged}></FormControl>
            </div>
            <div className='place-holders-div row'>
              <div className='col-lg-6 col-md-6'>
                <ControlLabel>Body : </ControlLabel>
              </div>
              <div className='col-lg-6 col-md-6'>
                <FormGroup>
                  <ControlLabel>Mandatory Fields :</ControlLabel>
                  <ButtonGroup className='mandatory-fields-btn-group'>
                    {this.props.selectedTemplateData.place_holders &&
                      this.props.selectedTemplateData.place_holders.split(',').length > 0
                      ? this.props.selectedTemplateData.place_holders.split(',').map((dt, k) => (
                        <Button key={k} onClick={() => this.props.DefaultTextSelected(dt) }>{dt}</Button>
                      )) : null }
                  </ButtonGroup>
                </FormGroup>
              </div>
            </div>
            <FormGroup validationState={!this.props.valid ? 'error' : null}>
              <ReactQuill value={this.props.selectedTemplateData.template ? this.props.selectedTemplateData.template : ''}
                onChange={(text) => this.props.TextEdited(text, this.props.selectedTemplateData.id, this.reactQuillRef) }
                onFocus={this.props.SetCurrentInstance(this.reactQuillRef) } name='template'
                ref={(el) => { this.reactQuillRef = el } } />
            </FormGroup>
            <div className='submit-cancel-btn'>
              <Button onClick={() => this.props.SaveTemplateDetails() } disabled={this.props.selectedTemplateData ? false : true} bsStyle='success'>Submit</Button>
              <Button onClick={() => this.props.CancelTemplateDetails() } bsStyle='warning'>Cancel</Button>
            </div>
          </div> : null}
      </div >
    );
  }
}

export default EmailTemplateDesigner;

