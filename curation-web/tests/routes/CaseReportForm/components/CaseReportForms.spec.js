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
let pa = 1
let chil = null
let tableData = [
   {id: 12, name: "First CRF Test", description: "Free will"},
   {id: 13, name: "Second CRF Test", description: "abcd"},
   {id: 14, name: "3rd CRF Test", description: "abcde"},
   {id: 15, name: "4th CRF Test", description: "abcdef"}
]

const wrapper = mount(<CaseReportForms
    router = {router}
    page= {1}
    children = {chil}
    CrfData = {tableData}
    ClearData={function() {}}
    OnPageChanged= {function() {}}
    SearchCRF= {function(arg) {}}
    GetCRFs= {function() {}}
    SortChange= {function(arg) {}}    
    TotalCount= {1}//{function() {}}
    DeleteModal= {function(arg) {}}
    />)

    describe('should render CRF table container', () => {
        
        it('should render crf container', () => {
            expect(wrapper.find('.app-body')).toExist
        })

        it('should render add crf link', () => {
            expect(wrapper.find('.add-case-report btn btn-default')).toExist
        })

        it('should render search crf', () => {
            expect(wrapper.find('.form-control')).toExist
        })

    describe('should render the whole table', () => {

        it("should render table", () => {
            expect(wrapper.find('.container').find('table')).toExist
        })
        it("should render tableheader", () => {
            expect(wrapper.find('.container').find('table thead')).toExist
        })
        it("should render tablebody", () => {
            expect(wrapper.find('.container').find('table tbody')).toExist
        })
        it("should render tablefooter", () => {
            expect(wrapper.find('.container').find('table tfoot')).toExist
        })

    })

         it("should render table, tableheader, tablebody, tablefooter", () => {
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

         it('should render all sampleData in table', () => {

            wrapper.find('.container').find('tbody tr').forEach((item, i) => {
                 let crf = tableData[i];        //our sampledata      
                let tab = ['CRF Name', 'CRF Description', 'Total Question'];          
                 item.find('td span').forEach((foo, j) => {
                        it('should render each item in sampledata', () =>{
                                 expect(foo.text()).toEqual(crf[tab[j]])
                        })
                  })                
             })  
         })

    })
})