import React from 'react'
import { default as EncounterMenuItems } from '../../../../src/routes/ChartReview/components/EncounterMenuItems'
import { default as ChartReview } from '../../../../src/routes/ChartReview/components/ChartReview'
import { mount } from 'enzyme';
import expect from 'expect'
import sinon from 'sinon';
import _ from 'lodash'

import staticPatientData from './samplePatientData.json';
import sampleQuestions from './sampleQuestions.json';
import sampleAnswers from './sampleAnswers.json';

describe('ChartReview component', () => {
beforeEach(function() {
    localStorage.logged_user_role = 'admin'
});
let questions = sampleQuestions;
let availableCRFS = {
    questions: questions
}
let answers = sampleAnswers
let routeParams = {
    projectId: 1
}
let question_type_text = ['text', 'numeric'];
let patientData = staticPatientData
let projectName = 'test project name'
const wrapper = mount(<ChartReview availableCRFS = {availableCRFS}
    projectName={projectName}
    question_type_text = {question_type_text}
    SetCohortID = {function() {}}
    removeChild = {function() {}}
    answers = {answers}
    patientData = {patientData}
    routeParams = {routeParams}
    />)
    
    describe('the chart review questions rendering', () => {                    
            (function() {                             
            localStorage.logged_user_role = 'admin'
        });

        it('should render all questions and its content', () => {
            expect(wrapper.find('.questions-content').length).toEqual(1)
            expect(wrapper.find('.crf-question').length).toEqual(sampleQuestions.length)
        })

        it('should render questions available', () => {
            wrapper.find('.crf-question').forEach((item, i) => {
                let question = questions[i];
                expect(item.find('.question-text').text()).toEqual(question.text)

                item.find('.question-options input').forEach((option, ind) => {
                    if (option.prop('name') == question.id) {
                        expect(question.responses.includes(option.prop('value')))
                    }
                })
            })

        })

        it('should NOT render HELP text link', () => {
            let question = [];
            let cuquestion = questions[1];
            wrapper.find('.crf-question').forEach((item) => {
                if (item.find('.question-text').text() == cuquestion.text) {
                    question.push(item)
                    return;
                }
            })
            expect(question[0].find('.help-text').length).toEqual(0)
        })

        it('should render HELP text link', () => {
            let question = [];
            let cuquestion = questions[0];
            wrapper.find('.crf-question').forEach((item) => {
                if (item.find('.question-text').text() == cuquestion.text) {
                    question.push(item)
                    return;
                }
            })
            expect(question[0].find('.help-text').length)
        })

        it('should NOT show ADD ANNOTATION link', () => {
            let question = [];
            let cuquestion = questions[0];
            wrapper.find('.crf-question').forEach((item) => {
                if (item.find('.question-text').text() == cuquestion.text) {
                    question.push(item)
                    return;
                }
            })
            expect(question[0].find('.btn-add-annotation').length == 0)
        })

        it('should show ADD ANNOTATION link', () => {
            let question = [];
            let cuquestion = questions[1];
            wrapper.find('.crf-question').forEach((item) => {
                if (item.find('.question-text').text() == cuquestion.text) {
                    question.push(item)
                    return;
                }
            })
            expect(question[0].find('.btn-add-annotation').length).toEqual(1)
        })

        it('should show ADD ANNOTATION prepopulated', () => {
            let question = [];
            let cuquestion = questions[0];
            wrapper.find('.crf-question').forEach((item) => {
                if (item.find('.question-text').text() == cuquestion.text) {
                    question.push(item)
                    return;
                }
            })
            expect(question[0].find('.annotation-textarea').text()).toEqual(cuquestion.annotation_text)
        })
    })

    describe('the chart review project and patient ids rendering', ()=>{
        it('should render project name', ()=>{
            expect(wrapper.find('.cohort-name').find('.text-info').text()).toEqual(_.upperFirst(projectName))
        })
        it('should render patient id', ()=>{
            expect(wrapper.find('.cohort-name').text().trim()).toEqual(`${_.upperFirst(projectName)} Patient ID: ${staticPatientData.patient_id}`)
        })
    })

    // describe('the chart review page should render patient details', ()=>{
    //     let patientSummaryComponent = wrapper.find('#patientSummary')
    //     let encountersComponent = wrapper.find('.encounters-panel')
        
    //     it('should render Patient Summary as header for panel', () => {
    //         expect(patientSummaryComponent.find('.panel-heading').text()).toEqual('Patient Summary')
    //     })

    //     it('should render all Summary details given', () => {
    //         expect(patientSummaryComponent.find('.encounter-label').length).toEqual(11)
    //     })
        
    //     it('should render all fields for given Patient Summary details', () => {

    //     })

    //     it('should display all encounters given', ()=>{
    //         expect(encountersComponent.find('#10/7/2015').length).toEqual(1)
    //         expect(encountersComponent.find('.individual-encounter-div').length).toEqual(2)
    //     })

    //     it('should render all OBSERVATIONS for given encounter', ()=>{
    //         encountersComponent.find('.individual-encounter-div').map((enc)=>{
    //             let observations = enc.find('.individual-encounter-div').find('.individual-observation')
    //             expect(observations.length).toEqual(2)
    //         })
    //     })

    //     it('should render all NOTES for given encounter', ()=>{
    //         encountersComponent.find('.individual-encounter-div').map((enc)=>{
    //             let domNotes = enc.find('.individual-encounter-div').find('.individual-note');
    //             let note = staticPatientData.encounters[0].note[0];

    //             expect(domNotes.length).toEqual(1)
    //             expect(domNotes.find('.note-text').text()).toEqual(`Text: ${note.text}`)
    //         })
    //     })

    //     it('should display RESULTS given', ()=>{
    //         encountersComponent.find('.individual-result').map((res)=>{
                
    //         })
    //     })

    // })
})