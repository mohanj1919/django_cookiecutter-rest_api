import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { OverlayTrigger, Popover, FormGroup, ControlLabel, FormControl, Button, Panel } from 'react-bootstrap';
import FieldGroup from '../../../components/FieldGroup';
import _ from 'lodash';
import Multiselect from 'react-bootstrap-multiselect';
import 'react-bootstrap-multiselect/css/bootstrap-multiselect.css';

export default class CRFQuestions extends Component {

  render() {
    return (
      <div>
        {this.props.questions && this.props.questions.length > 0
          ? <div className='crf-div-tab-content'>
            {this.props.questions.map((q, index) => (
              _.toInteger(q.parent_question) == 0 ?
                <div key={index}>
                  {renderQuestion(q, this) }
                  <hr />
                </div>
                :
                <div key={index}>
                  {this.props.answers[this.props.currentTemplateId] && this.props.answers[this.props.currentTemplateId][_.toInteger(q.parent_question)] &&
                    _.intersection(this.props.answers[this.props.currentTemplateId][_.toInteger(q.parent_question)], q.parent_response.split(',')).length > 0 ?
                    <div key={index}>
                      {this.props.addChild(q) }
                      {renderQuestion(q, this) }
                      <hr />
                    </div> : <span>{this.props.removeChild(q) }</span>}
                </div>
            )) }
          </div>
          : <div><label>No questions found for this CRF</label></div>}
      </div>
    )

    function capitalize(options) {
      options = _.map(options, function (option) {
        let val = option && option.value ? option.value.split('_').join(' ') : null;
        if (val) {
          let opt = { selected: option.selected, value: val.charAt(0).toUpperCase() + val.slice(1) }
          return opt
        }
        return null
      })
      return options
    }
    function renderQuestion(q, context) {
      return (<div className='crf-question'>
        {q.question_type.toLowerCase() != 'numeric' ?
          <div>
            <label className='question-text'>{q.text}</label>
            <div className='question-options'>
              {q.responses.split(',').map((o, i) => (
                <div key={i}>
                  <FieldGroup
                    id='response'
                    type={q.question_type}
                    onClick={q.question_type != 'date' ? (context.props.question_type_text.includes(q.question_type) ? () => { } : (e) => context.props.handleEditEvent(e, q.id, q.question_id)) : null }
                    onChange={q.question_type == 'date' ? (e) => { context.props.handleEditEvent(e, q.id, q.question_id) } : null }
                    onBlur={context.props.question_type_text.includes(q.question_type) ? (e) => context.props.handleEditEvent(e, q.id, q.question_id) : () => { } }
                    label={context.props.question_type_text.includes(q.question_type) ? '' : o}
                    defaultChecked={q.response.includes(_.trim(o.replace(/\n/g, " ").toLowerCase())) ? 'checked' : false}
                    defaultValue={q.question_type != 'date' ? q.response : (q.response[0] ? new Date(q.response[0]) : new Date()) }
                    value={context.props.question_type_text.includes(q.question_type) ? q.question_type == 'text' ? null : q.response : o}
                    name={q.id} />
                </div>
              )) }
            </div>
          </div> : <div>
            <label className='question-text'>{q.text}</label>
            <div className='question-options'>
              <FieldGroup
                type={q.question_type}
                onBlur={(e) => context.props.handleEditEvent(e, q.id, q.question_id) }
                value={q.response}
                name={q.id}
                min={_.toNumber(q.responses.split(',')[0]) ? q.responses.split(',')[0] : Number.MIN_SAFE_INTEGER}
                max={_.toNumber(q.responses.split(',')[1]) ? q.responses.split(',')[1] : Number.MAX_SAFE_INTEGER}
                />
            </div>
          </div>
        }
        <div className='annotation-controls'>
          {q.validationState ?
            <h5 className='text-danger'>* This field is required</h5> : null
          }
          <div className="row">
            {context.props.isReadOnly ?
              <div className="col-md-12">
                {!_.isEmpty(q.annotation_text) ? <div><label>Annotation: </label> {q.annotation_text}</div> : null}
                {!_.isEmpty(q.selectedOptions) ? <div><label>Sections: </label> {q.selectedOptions.join(', ') }</div> : null}
              </div> :
              <div>
                {_.isEmpty(q.annotation_text) && _.isEmpty(_.find(q.options, { selected: true })) ?
                  <Button className="col-md-8 btn-add-annotation" bsStyle='link' onClick={() => context.props.ToggleAnnotation(q.id, q.question_id) }>Add Annotation</Button> :
                  <div className="col-md-8">
                    <FieldGroup
                      componentClass="textarea" name='annotation'
                      defaultValue={q.annotation_text ? q.annotation_text : ''}
                      id={q.id}
                      className='annotation-textarea'
                      onChange={(e) => context.props.handleTextEdit(e, q.id, q.question_id) } />

                    {!_.isEmpty(q.options) ?
                      <Multiselect data={capitalize(q.options) } name='annotationOption' multiple
                        onChange={(e) => context.props.optionsChanged(e, q.id, q.question_id) }></Multiselect> : null
                    }
                  </div>
                }
                <div className="col-md-4">
                  {q.note ?
                    <OverlayTrigger trigger={["hover", "focus"]} placement="top" overlay={
                      <Popover id="popover-positioned-bottom" className='help-content'>
                        <span>{q.note}</span>
                      </Popover>}>
                      <h5 className='text-info help-text pull-right'>Help&nbsp; <i className='fa fa-question-circle-o'></i></h5>
                    </OverlayTrigger> : null}
                </div>
              </div>
            }
          </div>
        </div>
      </div>
      );
    }
  }
}
