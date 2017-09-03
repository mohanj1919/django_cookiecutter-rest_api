import React, { Component } from 'react'

import {FormGroup, ControlLabel, FormControl, HelpBlock, Radio, Checkbox} from 'react-bootstrap';
import NumericInput from 'react-numeric-input';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import '../../../scss/style.scss';

export default function FieldGroup({ id, label, help, validationState, ...props }) {
  return (
    <FormGroup controlId={id} validationState = {validationState || null}>
      {renderPage() }
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );

  function renderPage() {
    switch (props.type) {
      case 'date':
        return (
          <div>
            <ControlLabel>{label}</ControlLabel>
            {props.isRequired ? <span className='text-danger'> *</span> : null}
            <DatePicker className='form-control' selected={moment(new Date(props.defaultValue)) } onChange={props.onChange} name={props.name}/>
          </div>
        );
      case 'text':
        return (
          <div>
            <ControlLabel>{label}</ControlLabel>
            {props.isRequired ? <span className='text-danger'> *</span> : null}
            <FormControl {...props} />
          </div>
        )

      case 'checkbox':
        return (
          <span><Checkbox {...props}>{label}</Checkbox></span>
        );

      case 'radio':
        return (
          <span><Radio {...props}>{label}</Radio></span>
        );

      case 'numeric':
        return (
          <NumericInput className="form-control" mobile {...props} />
        )

      default:
        return (<div> <ControlLabel>{label}</ControlLabel>
          <FormControl {...props} /></div>);
    }
  }
}
