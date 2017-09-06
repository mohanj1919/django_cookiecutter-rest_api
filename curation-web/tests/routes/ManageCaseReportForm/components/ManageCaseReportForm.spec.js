import React from 'react';
import expect from 'expect'
import sinon from 'sinon';
import { default as ManageCaseReportForm } from '../../../../src/routes/CaseReportForm/routes/ManageCaseReportForm/components/ManageCaseReportForm'
import { mount } from 'enzyme';
import sampleQuesData from './SampleQuestionData.json'

describe('ChartReview component', () => {
    beforeEach(function () {
        localStorage.logged_user_role = 'admin'
    });
    let router = {
        push: function (arg) { }
    };
    let pa = {}
    let parentConditionTypes = [{
        text: 'Contains',
        value: 'contains'
    }, {
            text: 'Equals',
            value: 'equals'
        }]
    let questionTypes = [{
        text: 'Single',
        value: 'single'
    }, {
            text: 'Multiple',
            value: 'multiple'
        }, {
            text: 'Numeric',
            value: 'numeric'
        }, {
            text: 'Text',
            value: 'text'
        }, {
            text: 'Date',
            value: 'date'
        }]
    let templateDetails = { template_name: 'template name', filteredquestionData: sampleQuesData }
    const wrapper = mount(<ManageCaseReportForm
        router = {router}
        page= {pa}
        isFilesVisible={true}
        OnFileUpload={function (params) { } }
        templateDetails={templateDetails}
        ClearState={function () { } }
        questionTypes={questionTypes}
        parentConditionTypes={parentConditionTypes}
        />)

    describe('Manage crf component while edit', () => {
        it('should render Manage crf component', () => {
            expect(wrapper.find('.app-body')).toExist
        })
        it('should render template-details and required components', () => {
            expect(wrapper.find('.template-details')).toExist
            expect(wrapper.find('.template-details').find('FormGroup')).length = 3
        })
        it('existence of upload component(dropzone)', () => {
            expect(wrapper.find('Dropzone')).toExist
        })
    })
})