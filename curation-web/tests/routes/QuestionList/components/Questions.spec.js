import React from 'react'
import { default as QuestionList } from '../../../../src/routes/QuestionList/components/Questions'
import { mount } from 'enzyme';
import expect from 'expect'
import sinon from 'sinon';
import _ from 'lodash'
import sampleQuestions from './sampleQuestions.json'

describe('QuestionList component', () => {
    beforeEach(function () {
        localStorage.logged_user_role = 'admin'
    });

    let questions = { results: sampleQuestions };
    let newQues = {}
    const wrapper = mount(<QuestionList
        questions={questions}
        newQuestion={newQues}

        SortChange={function () { }}
        PageChanged={function () { }}
        LoadQuestionsData={function () { }}
        SearchQuestion={function () { }}
        SaveQuestion={function () { }}
        RemoveOption={function () { }}
        OptionAdded={function () { }}
    />)

    describe('question list table rendering', () => {
        beforeEach(function () {
            localStorage.logged_user_role = 'admin'
        });

        it(' should render questions table ', () => {
            // expect(wrapper.find('.questions-container').length).toEqual(1)
            expect(wrapper.find('.container').length).toEqual(1)
        })

        it(" should render table, tableheader, tablebody, tablefooter", () => {
            expect(wrapper.find('.questions-container').find('.container').find('table')).toExist

            expect(wrapper.find('.questions-container').find('.container').find('table thead')).toExist

            expect(wrapper.find('.questions-container').find('.container').find('table tbody')).toExist
 
            expect(wrapper.find('.questions-container').find('.container').find('table tfoot')).toExist
        })

         it('should render (Table header)number of columns in the table', () => {
             let count = 0;
            wrapper.find('.questions-container').find('.container').find('thead tr th').forEach((foo, k) => {
                count += 1;
            })
                       expect(count).toEqual(5);
         })

         it('should render Table header names in the table', () => {
            let tab = ['Question Text', 'Question Type', 'Description', 'Responses', 'Actions']
            wrapper.find('.questions-container').find('.container').find('thead tr').forEach((foo, k) => {
                foo.find('th').forEach((boo, i) => {
                    expect(boo.text()).toEqual(tab[i])
                })
            })
                    //    expect(count).toEqual(5);
         })

        it('should render all sampleQuestions in table', () => {

            wrapper.find('.questions-container').find('.container').find('tbody tr').forEach((item, i) => {
                 let question = sampleQuestions[i];        //our samplequestions      
                //  console.log(item.html());
                //  console.log('\n')
                 let seq = ['text', 'type', 'description', 'responses'];            
                 item.find('td span').forEach((foo, j) => {
                        it('should render each item in sampleQuestions', () =>{
                                //  console.log(foo.text())
                                 expect(foo.text()).toEqual(question[seq[j]])
                        })
                  })                
             })  
         })


})
})