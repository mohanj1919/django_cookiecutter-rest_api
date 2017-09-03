import React from 'react'
import { default as PageNotFound } from '../../../../src/routes/PageNotFound/components/PageNotFound'
import { mount } from 'enzyme';
import expect from 'expect'
import sinon from 'sinon';
import _ from 'lodash'

describe('PageNotFound Component', () =>{
    
    let wrapper = mount(<PageNotFound/>)

        it('should render login container', () =>{
            expect(wrapper.find('app unauth-layout').find('.header-login')).toExist
        })

        it('should render navigation bar', () =>{
            expect(wrapper.find('app unauth-layout').find('.header-login').find('container')).toExist
        })
        
        it('should render OM1 image', () =>{
            expect(wrapper.find('app unauth-layout').find('.header-login').find('container').find('brand-logo navbar-brand')).toExist
        })

        it('should render footer', () =>{
            expect(wrapper.find('app unauth-layout').find('.header-login').find('container').find('app-footer')).toExist
        })
        
        it('should render error msg heading', () => {
            expect(wrapper.find('.text-info error-message')).toExist
        })

})