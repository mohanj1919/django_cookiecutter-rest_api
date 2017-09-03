import React from 'react'
import { default as CaseReportForms } from '../../../../src/routes/CaseReportForm/components/CaseReportForms'
import { mount } from 'enzyme';
import expect from 'expect'
import sinon from 'sinon';
import _ from 'lodash'

describe('CaseReportForms Component', () => {
    beforeEach(function () {
        localStorage.logged_user_role = 'admin'
    });

let router = {
    push : function(arg) {}
};
let pa = {}
let chil = null
let tableData = [{
    //     "id": 2,
	// 	"text": "Test",
	// 	"description": "Desc",
	// 	"created_on": "2017-08-29T14:45:53.419190Z",
	// 	"updated_on": "2017-08-29T14:45:53.419267Z"
	// },
	// {
	// 	"id": 5,
	// 	"text": "Pain",
	// 	"description": "Patient with Diabetes",
    //     ""
	// 	"created_on": "2017-08-29T16:28:28.868622Z",
	// 	"updated_on": "2017-08-29T16:28:28.868644Z"
}]

const wrapper = mount(<CaseReportForms
    router = {router}
    page= {pa}
    children = {chil}
    CrfData = {tableData}

    OnPageChanged= {function() {}}
    SearchCRF= {function(arg) {}}
    GetCRFs= {function() {}}
    SortChange= {function(arg) {}}    
    TotalCount= {function() {}}
    DeleteModal= {function(arg) {}}
    />)

    describe('should render CRF table ', () => {
        
        it('should render crf container', () => {
            expect(wrapper.find('.app-body')).toExist
        })

        it('should render add crf link', () => {
            expect(wrapper.find('.add-case-report btn btn-default')).toExist
        })

         it(" should render table, tableheader, tablebody, tablefooter", () => {
            expect(wrapper.find('.container').find('table')).toExist

            expect(wrapper.find('.container').find('table thead')).toExist

            expect(wrapper.find('.container').find('table tbody')).toExist
 
            expect(wrapper.find('.container').find('table tfoot')).toExist
        })

         it('should render (Table header)number of columns in the table', () => {
             let count = 0;
            wrapper.find('.container').find('thead tr th').forEach((foo, k) => {
                count += 1;
            })
                       expect(count).toEqual(4);
         })

           it('should render Table header names in the table', () => {
            let tab = ['CRF Name', 'CRF Description', 'Total Question', 'Actions']
            wrapper.find('.questions-container').find('.container').find('thead tr').forEach((foo, k) => {
                foo.find('th').forEach((boo, i) => {
                    expect(boo.text()).toEqual(tab[i])
                })
            })
                    //    expect(count).toEqual(5);
         })



    })
})