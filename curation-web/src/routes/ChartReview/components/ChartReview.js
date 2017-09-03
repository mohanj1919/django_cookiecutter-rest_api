import React, { Component } from 'react'
import { Panel, DropdownButton, MenuItem, Button, InputGroup, FormControl } from 'react-bootstrap'
import FieldGroup from '../../../components/FieldGroup'
import ShowDetails from './ShowDetails'
import EncounterMenuItems from './EncounterMenuItems'
import { Typeahead, AsyncTypeahead } from 'react-bootstrap-typeahead'
import './ChartReviewStyles.scss';
import CRFQuestion from './_CRFQuestions.js'
import _ from 'lodash'

class ChartReview extends Component {
  componentDidMount() {
    this.props.SetCohortID(this.props.routeParams.projectId, this.props.routeParams.cohortId, this.props.routeParams.patientId, this.props.routeParams.curatorId)
    if (window.location.href.includes('#')) {
      let rep = window.location.href.substring(window.location.href.lastIndexOf('#'), window.location.href.length)
      window.location.href = window.location.href.replace(rep, '')
    }
  }
  componentWillUnmount() {
    this.props.ClearData();
  }

  NavigateToDiv(pos) {
    if (window.location.href.includes('#')) {
      let rep = window.location.href.substr(window.location.href.lastIndexOf('#') + 1, window.location.href.length)
      window.location.href = window.location.href.replace(rep, pos)
    } else {
      window.location.href = window.location.href + '#' + pos
    }
  }

  render() {
    let encountersdates = []
    if (this.props.patientData && this.props.patientData.encounters) {
      encountersdates = [...new Set(this.props.patientData.encounters.sort(function (a, b) {
        return new Date(b.start) - new Date(a.start)
      }).map(item => new Date(item.start).toLocaleDateString()))]
    }
    return (
      <div className='container'>
        {this.props.patientData ?
          <div>
            <div className='row row-eq-height cohort-name-heading'>
              <div className='col-sm-12'>
                <label className='cohort-name'><span className='text-info'>{_.upperFirst(this.props.projectName) }</span>
                  {this.props.patientData ? <span><i className='fa fa-chevron-right'></i> Patient ID: {this.props.patientData.patient_id} </span> : null}
                </label>
              </div>
            </div>

            <div className='row template-content'>
              <div className='col-md-4 crf-div'>
                {!_.isEmpty(this.props.availableCRFNames) ?
                  <div className='template-selection'>
                    <DropdownButton id='crfSection' title={this.props.availableCRFS.name} className={this.props.isCompletedRequired || _.isEmpty(this.props.availableCRFS) ? 'disable-form' : null}>
                      {this.props.availableCRFNames.map((en, index) =>
                        <MenuItem onClick={(e) => this.props.SelectTemplate(e, en) } key={index}>
                          <span className="text-info">{en.name} - <span className="crf-status">{en.status}</span></span>
                        </MenuItem>) }
                    </DropdownButton>
                  </div>
                  : null}

                {this.props.patientData ? !_.isEmpty(this.props.availableCRFS) ? <div id='crf-tabs'>
                  <form className='render-template'>
                    <div className={'questions-content'}>
                      <div className={this.props.availableCRFS.disabled ? 'disable-form' : null}>
                        <CRFQuestion
                          templateId={this.props.availableCRFS.id}
                          currentTemplateId={this.props.currentTemplateId}
                          answers={this.props.answers}
                          questions={this.props.availableCRFS.questions}
                          handleEditEvent={this.props.handleAnswerEvent}
                          handleTextEdit={this.props.handleEditEvent}
                          optionsChanged={this.props.optionsChanged}
                          addChild={this.props.addChild}
                          removeChild={this.props.removeChild}
                          question_type_text={this.props.question_type_text}
                          ToggleAnnotation={this.props.ToggleAnnotation}
                          isReadOnly={this.props.isReadOnly}/>
                      </div>
                    </div>
                    {!this.props.isReadOnly ?
                      <div className='crf-controls'>
                        {this.props.pendingCRFS && this.props.pendingCRFS > 1 ?
                          <span>
                            <Button bsStyle='default' onClick={this.props.SubmitTemplate}>Next CRF <i className='fa fa-chevron-right'></i></Button>
                          </span> : null}

                        <span className={this.props.isCompletedRequired ? 'disable-form' : null}>
                          <Button bsStyle='primary' onClick={this.props.CompleteCuration} disabled={this.props.isCompletedRequired} className='pull-right'>Submit</Button>
                        </span>
                      </div> : null}

                  </form>
                </div> : <h4 className='text-info text-center'>No CRF Template(s) found for this patient</h4> : null}

              </div>

              <div className='col-md-8 patient-summary-div'>
                <div>
                  <div className='jump-to-control'>
                    <div className='col-md-4'>
                      {this.props.patientData ? <FormControl id='selectSection' componentClass='select'
                        onChange={(event) => this.NavigateToDiv(event.target.value) } value={window.location.href.includes('#') ? window.location.href.substr(window.location.href.lastIndexOf('#') + 1, window.location.href.length) : ''}>
                        <option value='patientSummary' key='patientSummary'>Jump to Encounter on</option>
                        {encountersdates ?
                          encountersdates.map((en, l) => (
                            <option value={en} key={l}>{en}</option>
                          )) : null}
                      </FormControl> : null}
                    </div>
                  </div>
                  <div className='details-tab'>
                    <div id='patientSummary'>
                      <Panel header={'Patient Summary'}>
                        <div className='row'>
                          {this.props.patientData ? Object.keys(this.props.patientData).map((pd, index) => (
                            typeof (this.props.patientData[pd]) != 'object' ? (
                              <ShowDetails text={pd} value={this.props.patientData[pd] ? this.props.patientData[pd] : 'N/A'} />
                            ) : null
                          )) : null}
                        </div>
                      </Panel>
                    </div>
                    <div className='encounters-panel'>
                      <Panel header={'Encounters'}>
                        {this.props.patientData && this.props.patientData.encounters && this.props.patientData.encounters.length > 0 ?
                          <div>
                            <EncounterMenuItems encountersData={this.props.patientData.encounters} TogglingCollapse={this.props.TogglingCollapse} />
                          </div>
                          : <div className='no-encounters-info'><h4>There are No Encounters to Show</h4></div>
                        }
                      </Panel>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          : <h4 className='select-patient-info text-info'>No Patients available for curation in this cohort.</h4>}
      </div>
    );
  }
}

export default ChartReview;
