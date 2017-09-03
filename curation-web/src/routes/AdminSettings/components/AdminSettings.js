import React, { Component } from 'react'
import { Button, FormControl, FormGroup, ControlLabel, Panel, HelpBlock } from 'react-bootstrap'
import './AdminSettingsStyles.scss';
import _ from 'lodash'

class AdminSettings extends Component {
  componentDidMount() {
    this.props.GetAdminSettings()
  }

  render() {
    return (
      <div className='settings-data-div'>
        {this.props.SettingsData && this.props.SettingsData.length > 0 ?
          <div className='container'>
            <div className='col-md-6'>
              {this.props.groups ? this.props.groups.map((grp, i) => (
                <div key={i}> {grp ? <label>{grp}</label> : null}
                  <div className='well'>
                    {this.props.SettingsData.map((sg, j) => (
                      sg.settings_group == grp ?
                        (
                          <FormGroup className='individual-setting' validationState={sg.ValidationState} key={j}>
                            <div>
                              <ControlLabel className='required'>{sg.text}</ControlLabel>
                            </div>
                            <div>
                              <FormControl type={sg.type ? sg.type : 'text'} name={sg.setting}
                                value={sg.value} onChange={this.props.HandleTextEdit}>
                              </FormControl>
                              {sg.Help ? <HelpBlock>{sg.Help}</HelpBlock> : null}
                            </div>
                          </FormGroup>
                        ) : null
                    )) }
                  </div>
                </div>
              )) : null}

              <div className='btn-set'>
                <span>
                  <span className='save-btn'>
                    <Button bsStyle='success' onClick={() => { this.props.SubmitSettings() } }>Save</Button>
                  </span>
                  <span className='cancel-btn'>
                    <Button bsStyle='default' onClick={() => { this.props.CancelEditing() } }>Cancel</Button>
                  </span>
                </span>
              </div>
            </div>
          </div> : <div className='no-settings-info'>
            <h4>No settings found</h4>
          </div>}
      </div>
    );
  }
}

export default AdminSettings;
