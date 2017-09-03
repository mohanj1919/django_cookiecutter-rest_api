import React, { Component } from 'react'
import { Button, ButtonToolbar, ToggleButtonGroup, ToggleButton, DropdownButton, MenuItem } from 'react-bootstrap'
import { Typeahead, AsyncTypeahead } from 'react-bootstrap-typeahead'
import FieldGroup from '../../../../../components/FieldGroup';
import { HideBanner } from '../../../../../modules/global.js';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import config from '../../../../../config';
import _ from 'lodash'
import './Styles.scss'

class ShowPatients extends Component {
    componentDidMount() {
        this.props.FetchPatientData();
    }
    render() {
        var tableCell = (cell, row) => {
            return (
                <span className='patient-search-data' title={cell}>{cell}</span>
            )
        }
        var activeFormatter = (cell, row) => {
            return (
                <div>
                    {this.props.searchParams.status!=config.PATIENT_STATUS.INPROGRESS?
                    <div>
                        <Button bsStyle='primary' title={'View Patient'} onClick={() => this.props.ShowPatientDetails(row) }>
                            <i className='fa fa-eye' aria-hidden="true"></i>
                        </Button>&nbsp; &nbsp;
                        {localStorage.getItem('logged_user_role') != 'curator' ?
                        <span className="download-att">  
                            <DropdownButton className='fa fa-download'>
                                <MenuItem eventKey="1" onClick={() => this.props.ExtractCRFs(row, 'csv')}>CSV</MenuItem>
                                <MenuItem eventKey="1" onClick={() => this.props.ExtractCRFs(row, 'JSON')}>JSON</MenuItem>
                            </DropdownButton>
                        </span>:null}
                    </div>
                    :
                    <div>
                        <Button bsStyle='link'
                         onClick={()=>this.props.Unassign(row)}><i className='fa fa-times'></i> Unassign</Button>
                    </div> 
                    }

                </div>
            );
        }
        var options = {
            onPageChange: this.props.PageChange,
            page: this.props.pageNumber,
            paginationShowsTotal: true,
            sizePerPageList: [{
                text: '10', value: 10
            },
                {
                    text: '25', value: 25
                },
                {
                    text: '50', value: 50
                }],
            onSortChange: this.props.SortChange
        };
        return (
            <div className='container'>
                <div>
                    <div className='well'>
                        <div className="row">
                            <div className="col-md-3">
                                <label>Project name</label>
                                <AsyncTypeahead
                                    onSearch={(search) => this.props.GetProjects(search) }
                                    name='project'
                                    onChange={(search) => { search.type = 'project'; this.props.FilterPatients(search) } }
                                    options={this.props.availableProjects ? this.props.availableProjects : []}
                                    labelKey={'name'}
                                    />
                            </div>
                            <div className="col-md-3">
                                <label>Cohort name</label>
                                <AsyncTypeahead
                                    onSearch={(search) => this.props.GetCohorts(search) }
                                    onChange={(search) => { search.type = 'cohort'; this.props.FilterPatients(search) } }
                                    name='cohort'
                                    options={this.props.availableCohorts ? this.props.availableCohorts : []}
                                    labelKey={'name'}
                                    />
                            </div>
                            <div className="col-md-3">
                                <label>Patient Id</label>
                                <AsyncTypeahead
                                    onSearch={(search) => this.props.GetPatients(search) }
                                    onChange={(search) => { search.type = 'patient'; this.props.FilterPatients(search) } }
                                    name='patient'
                                    options={this.props.availablePatients ? this.props.availablePatients : []}
                                    />
                            </div>
                        </div>
                    </div>
                    
                    <div className="row">
                    {localStorage.getItem('logged_user_role') != 'curator' ?
                    <div className='col-md-12'>
                        <div className='text-info'>Status:</div>
                        <ButtonToolbar>
                            <ToggleButtonGroup type="radio" name="options" defaultValue={config.PATIENT_STATUS.COMPLETED} 
                                onChange={(e)=>{this.props.ChangeStatus(e) }}>
                                <ToggleButton value={config.PATIENT_STATUS.INPROGRESS}>In Progress</ToggleButton>
                                <ToggleButton value={config.PATIENT_STATUS.COMPLETED}>Completed</ToggleButton>
                            </ToggleButtonGroup>
                        </ButtonToolbar>
                    <br />
                    </div>:null}
                        <div className="col-md-12">
                            <BootstrapTable
                                data={this.props.patients}
                                striped={true}
                                hover={true}
                                className={'patients-search-table'}
                                fetchInfo={{
                                    dataTotalSize: this.props.totalCount
                                }}
                                options={options}
                                pagination
                                remote>
                                <TableHeaderColumn dataField="patient_id" isKey={true} dataSort={true}>Patient Id</TableHeaderColumn>
                                <TableHeaderColumn dataFormat={tableCell} dataField="project_name" dataSort={true}>Project Name</TableHeaderColumn>
                                <TableHeaderColumn dataFormat={tableCell} dataField="cohort_name" dataSort={true}>Cohort Name</TableHeaderColumn>
                                <TableHeaderColumn dataFormat={tableCell} dataField="curator_email" dataSort={true}>Curator</TableHeaderColumn>
                                <TableHeaderColumn dataFormat={activeFormatter} columnClassName='patients-actions'>Actions</TableHeaderColumn>
                            </BootstrapTable>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ShowPatients