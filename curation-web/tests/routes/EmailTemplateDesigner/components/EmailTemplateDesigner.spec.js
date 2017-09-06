import React from 'react'
// import { default as EmailTemplateDesigner } from '../../../../src/routes/EmailTemplateDesigner/components/EmailTemplateDesigner'
import { mount } from 'enzyme';
import expect from 'expect'
import sinon from 'sinon';
import _ from 'lodash'

/*
describe('EmailTemplateDesigner component', () => {

    let selectedTemplateData = {
        display_name : '',
        subject : 'sdvds',
        id : 12,
        name : 'kmm',
        place_holders : '',
        template : '',
     }
      
    let templateData = [ {selectedTemplateData}]
    let valid = {}
    let errorText = {}

    const wrapper = mount(<EmailTemplateDesigner
        selectedTemplateData={selectedTemplateData}
        templateData={templateData}
        valid={valid}
        errorText={errorText}

        TemplateSelected={function () { }}
        GetTemplateDetails={function () { }}
        SubjectChanged={function () { }}
        DefaultTextSelected={function (arg) { }}
        TextEdited={function (arg1, arg2, arg3) { }}
        SetCurrentInstance={function (arg) { }}
        SaveTemplateDetails={function () { }}
        CancelTemplateDetails={function () { }}
    />)

    it('should render select template label', () => {
        expect(wrapper.find('template-name col-lg-4 col-md-4 control-label')).toExist;
    })

    it('should render select template dropdown', () => {
        expect(wrapper.find('template-name col-lg-4 col-md-4 form-control')).toExist;
    })

    it('should render subject label', () => {
        expect(wrapper.find('subject-div')).toExist;
    })

    it('should render subject input box', () => {
        expect(wrapper.find('subject-div form-control')).toExist;
    })

})*/