import React, {Component} from 'react';
import {Typeahead, AsyncTypeahead} from 'react-bootstrap-typeahead'
import {Button, InputGroup, FormGroup, ControlLabel} from 'react-bootstrap';
import FieldGroup from '../../../../../components/FieldGroup';
import './style.scss';

class Projects extends Component {
  componentDidMount() {
    this.props.ToggleLoading(true);
    this.props.FetchUsers(this.props.routeParams.cohortId);
  }

  componentWillUnmount() {
    this.props.ClearData();
  }

  submitFormFunction() {
    this.props.SaveCohort();
  }

  render() {
    return (
      <div className='container'>
        <div className='row cohort-configure'>
          <div className='col-md-6'>
            <form onSubmit={(evt) => { this.submitFormFunction(); evt.preventDefault(); } }>
              <label>Define Project</label>
              <div className='well'>
                <FieldGroup
                  type='text'
                  name='name'
                  isRequired={true}
                  value={this.props.project.name}
                  onChange={this.props.handleEvent}
                  autoComplete={'off'}
                  help = {this.props.project.validationState ? this.props.project.nameErrorMessage : null}
                  validationState = {this.props.project.validationState}
                  label='Project Name'/>

                <FieldGroup
                  type='text'
                  name='description'
                  isRequired={true}
                  componentClass='textarea'
                  value={this.props.project.description}
                  onChange={this.props.handleEvent}
                  autoComplete={'off'}
                  validationState = {this.props.project.descriptionValidationState}
                  placeholder = {'Description should have atleast 2 sentences'}
                  help = {this.props.project.descriptionValidationState ? this.props.project.descriptionErrorMessage : null}
                  label='Project Description'/>
              </div>

              <label>Add Cohort(s) </label>
              <div className='well'>
                <FormGroup>
                  <AsyncTypeahead onSearch={() => { } }
                    onInputChange={(search) => this.props.GetCohortsList(search) }
                    labelKey={option => `${option.name}`} name='name'
                    ref={ref => this._typeahead = ref}
                    options={this.props.cohorts.availableCohorts ? this.props.cohorts.availableCohorts : []}
                    onChange={(e) => {
                      this.props.AddCohort(e); this.props.clearInstance(this._typeahead)
                    } } placeholder='Enter Cohort name' emptyLabel= {'No Cohorts Found'}/>
                </FormGroup>
                <div className='selected-curators'>
                  {this.props.cohorts.assignedCohorts.map((item, index) => <span key={index} className='cstm-chip' title={item.name}>
                    <span className='subject'>{item.name}</span>
                    <button value={item.id} onClick={(e) => this.props.RemoveCohort(e) }>x</button>
                  </span>) }
                </div>
              </div>

              <label>Add Curator(s) </label>
              <div className='well'>
                <FormGroup>
                  <AsyncTypeahead
                    onSearch={() => { } }
                    onInputChange={(search) => this.props.GetCuratorsList(search) }
                    labelKey={option => `${option.email}`} name='email'
                    ref={ref => this._typeaheadCurators = ref}
                    options={this.props.curators.usersEmail ? this.props.curators.usersEmail : []}
                    onChange={(e) => { this.props.AddCurator(e); this.props.clearInstance(this._typeaheadCurators) } }
                    placeholder='Enter User Email ID'
                    emptyLabel={'No Curators Found'} />
                </FormGroup>
                <div className='selected-curators'>
                  {this.props.curators.assignedCurators.map((item, index) => <span key={index} className='cstm-chip' title={item.email}>
                    <span className='sub-initial'>{item.email[0]}</span>
                    <span className='subject'>{item.email}</span>
                    <button value={item.id} onClick={(e) => this.props.RemoveCurator(e) }>x</button>
                  </span>) }
                </div>
              </div>

              <label>Select CRF template</label>
              <div className='crf-template-panel well'>
                <FormGroup>
                  <InputGroup>
                    <AsyncTypeahead onSearch={() => { } }
                      onInputChange={(search) => this.props.GetCRFList(search) }
                      labelKey={option => `${option.name}`} name='name'
                      ref={ref => this._typeaheadCRFTemplates = ref}
                      options={this.props.CRFTemplates.options ? this.props.CRFTemplates.options : []}
                      onChange={(e) => this.props.SelectTemplate(e) }
                      placeholder='Enter CRF template name'
                      emptyLabel={'No Templates Found'} />
                    <InputGroup.Button>
                      <Button bsStyle='default' onClick={() => { this.props.AddTemplate(); this._typeaheadCRFTemplates.getInstance().clear() } }>
                        Add</Button>
                    </InputGroup.Button>
                  </InputGroup>
                  <div className='isrequired-checkbox'>
                    <label><input type='checkbox' onChange={this.props.handleCheckBoxEvent}
                      checked={this.props.currentTemplateRequired}
                      name='currentTemplateRequired' /> Is Required</label>
                  </div>
                </FormGroup>
                <div className='crf-Templates'>
                  {this.props.CRFTemplates.selectedTemplates.map((item, index) => <span key={index} className='cstm-chip'>
                    {item.name}
                    {item.isRequired ? <span className='text-danger'><h3>*</h3></span> : null}
                    <button value={item.id} onClick={(e) => this.props.RemoveTemplate(e) }>x</button></span>) }
                </div>
              </div>
              <Button bsStyle='success' type='submit' className='pull-left'>Save</Button>
              <Button bsStyle='link' className='pull-right' onClick={this.props.CancelProject}>Cancel</Button>
            </form>

          </div>
        </div>
      </div>
    );
  }
}
export default Projects;