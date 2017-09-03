import React, { Component } from 'react'
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import { Button, InputGroup, Modal } from 'react-bootstrap'
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Link } from 'react-router'
import './CaseReportFormsStyles.scss'

class CaseReportForms extends Component {
    componentWillMount() {
        this.props.GetCRFs()
    }

    render() {
        var tableCell = (cell, row) => {
            return (
                <span className='file-data' title={cell}>{cell}</span>
            )
        }
        var createCustomAddButton = () => {
            return (
                <Button className='add-case-report' onClick={() => this.props.router.push('casereportform/managecasereportform') }><i className='fa fa-plus'></i> Add CRF</Button>
            )
        }
        var ActionColumnFormatter = (cell, row) => {
            let editUrl = `casereportform/managecasereportform/${row.id}`
            return (
                <div>
                    <span className='edit-button'>
                        <Button bsStyle='primary' onClick={() => this.props.router.push(editUrl) } title={'Edit CRF'}>
                            <i className='fa fa-pencil-square-o' aria-hidden="true"></i>
                        </Button>
                    </span>
                    <span className='delete-button'>
                        <Button bsStyle='danger' onClick={() => this.props.DeleteModal(row.id) } title={'Delete CRF'}>
                            <i className="fa fa-trash-o" aria-hidden="true"></i>
                        </Button>
                    </span>
                </div>
            );
        }
        var customSearchField = () => {
            return (
                <InputGroup className='search-questions'>
                    <input type='text' placeholder='Search CRF' onChange={(e) => this.props.SearchCRF(e) } className='form-control'/>
                    <InputGroup.Addon><i className="fa fa-search"></i></InputGroup.Addon>
                </InputGroup>
            );
        }
        var options = {
            btnGroup: createCustomAddButton,
            onPageChange: this.props.OnPageChanged,
            paginationShowsTotal: true,
            page: this.props.page,
            searchField: customSearchField,
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
            <div>
                <br />
                {!this.props.children ?
                    <div className='container'>
                        <div className='container'>
                            <div className='row'>
                                <BootstrapTable
                                    data={ this.props.CrfData }
                                    pagination={true}
                                    striped={true}
                                    hover={true}
                                    fetchInfo={{
                                        dataTotalSize: this.props.TotalCount
                                    }}
                                    search={true}
                                    options={ options }
                                    remote>
                                    <TableHeaderColumn dataFormat={tableCell} dataSort={true} dataField='name' isKey={true}>CRF Name</TableHeaderColumn>
                                    <TableHeaderColumn  dataFormat={tableCell} dataSort={true} dataField='description'>CRF Description</TableHeaderColumn>
                                    <TableHeaderColumn  dataFormat={tableCell} dataField='total_questions'>Total Question</TableHeaderColumn>
                                    <TableHeaderColumn dataFormat={tableCell} dataFormat={ActionColumnFormatter}>Actions</TableHeaderColumn>
                                </BootstrapTable>
                            </div>
                        </div>
                    </div>
                    : this.props.children}
            </div>
        )
    }
}

export default CaseReportForms
