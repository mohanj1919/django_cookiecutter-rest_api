import React from 'react'
import { default as CuratorProjects } from '../../../../src/routes/Home/routes/CuratorProjects/components/CuratorProjects'
import { mount } from 'enzyme';
import expect from 'expect'
import sinon from 'sinon';
import _ from 'lodash'


describe('CuratorProjects component', () => {

    let pa = 1
    let totalCount = 1
    let projectsData = [
        {
            cohort : {id: 1, name: "Back Pain", description: null, patients: [4, 2, 3, 1]},
            patient_stats:{has_pending_patients: true, total: 4, pending: 3, completed: 0, in_progress: 1},
            project:{id: 1, name: "Project Name 1504012363950", description: "Project Description 1504012363950"}
        },
        {
            cohort : {id: 2, name: "knee Pain", description: null, patients: [4, 2, 3, 1]},
            patient_stats:{has_pending_patients: true, total: 5, pending: 3, completed: 1, in_progress: 1},
            project:{id: 2, name: "Project Name 007", description: "Project Description 007"}
        }
    ]

    const wrapper = mount(<CuratorProjects
        page = {pa}
        totalCount = {totalCount}
        projectsData = {projectsData}

        PageChanged={function () { }}
        SearchProject={function () { }}
        SortChange={function () { }}

    />)

    describe('project list table rendering', () => {

        it(' should render projects table ', () => {
            expect(wrapper.find('.projects-container').length).toEqual(1)
        })

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

         it('should render (Table header)number of columns in the table', () => {
             let count = 0;
            wrapper.find('.projects-container').find('thead tr th').forEach((foo, k) => {
                count += 1;
            })
                       expect(count).toEqual(5);
         })

         it('should render Table header names in the table', () => {
            let tab = ['Project Name', 'Cohort Name', 'Completed Patients', 'Total Patients', 'Actions']
            wrapper.find('.container').find('thead tr').forEach((foo, k) => {
                foo.find('th').forEach((boo, i) => {
                    expect(boo.text()).toEqual(tab[i])
                })
            })
         })

        it('should render all sampleprojects in table', () => {

            wrapper.find('.container').find('tbody tr').forEach((item, i) => {
                 let question = projectsData[i];        //our samplequestions      
                 let seq = ['text', 'type', 'description', 'responses'];            
                 item.find('td span').forEach((foo, j) => {
                        it('should render each item in sampleprojects', () =>{
                                //  console.log(foo.text())
                                 expect(foo.text()).toEqual(question[seq[j]])
                        })
                  })                
             })  
         })


})
})