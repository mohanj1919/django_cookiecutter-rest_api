import React from 'react'
import { default as Login } from '../../../../src/routes/Login/components/Login'
import { default as AuthOne } from '../../../../src/routes/Login/components/_authOne'
import { default as GoogleAuth } from '../../../../src/routes/Login/components/_googleAuth'
import { default as ForgotPassword } from '../../../../src/routes/Login/components/_forgotPassword'
import { default as ConfirmEmailSent } from '../../../../src/routes/Login/components/_confirmEmailSent'
import { mount } from 'enzyme';
import expect from 'expect'
import sinon from 'sinon';
import _ from 'lodash'

describe('Login component', () => {

let banner = {
    showBanner : ''//showBanner,
    ,showType : ''//showType,
    ,showTime: ''//showTime,
    ,showMessage : ''//showMessage,
}

    let username={}
    let password={}
    let authcode = {}
    let currentPage={}
    let show_resend_link={}
    let handleEvent={}

const wrapper = mount(<Login
    banner = {banner}
    username={username}
    password={password}
    authcode = {authcode}
    currentPage={currentPage}
    show_resend_link={show_resend_link}
    handleEvent={handleEvent}

    InvalidLoginMessage = { function () {}}
    OTPLabel = { function () {}}
    ValidateUserToken = { function () {}}
    banner = {banner}
    Hidebanner = {function () {}}
    LogIn = {function () {}}
    SendForgotPasswordLink = {function () {}}
    Authenticate={function () {}}
    ForgotPassword={function () {}}
    RedirectToLogin={function () {}}

 />)

    describe('Login page rendering', () => {

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

    })

})


describe('AuthOne Component', () => {

let username = {
    value : '',
    validationState : '',
    helpBlockText : '',
}

let password = {
    value : '',
    validationState : '',
    helpBlockText : '',
}
    let handleEvent={}

const wrapper = mount(<AuthOne
    username={username}
    handleEvent={handleEvent}
    password = {password}

    LogIn={function () {}}
    ForgotPassword={function () {}}
    InvalidLoginMessage={function () {}}
/>)

    describe('should render login form', () => {

        it('should render Login heading', () => {
            expect(wrapper.find('text-h3-padding')).toExist
        })

        it('should render Email & password label', () => {
        let inp = ['Email address', 'Password'];
        wrapper.find('.control-label').forEach((item, i) => {
                expect(item).toExist
                expect(item.text()).toEqual(inp[i])
             }) 
        })

        it('should render Email & password input boxes', () => {
        let count = 0;
        wrapper.find('.form-control').forEach((item, i) => {
                count += 1;
             })
             expect(count).toEqual(2); 
        })

        it('should render Next button', () => {
            expect(wrapper.find('.btn btn-primary')).toExist
            wrapper.find('.btn btn-primary').forEach((item, i) => {
                expect(item.text()).toEqual('Next')
            })
        })

        it('should render forgot Password? ', () => {
            expect(wrapper.find('.btn btn-link')).toExist
            wrapper.find('.btn btn-link').forEach((item, i) => {
                expect(item.text()).toEqual('Forgot password?')
            })
        })

    })
})

describe('Google Auth component', () => {

let username = { value : '' }
let authCode = {
    value : '',
    helpBlockText : '',
    validationState : '',
}
let show_resend_link={}
let handleEvent={}

const wrapper = mount(<GoogleAuth
    username = {username}
    handleEvent = {handleEvent}
    authCode = {authCode}
    show_resend_link = {show_resend_link}

    Authenticate = {function () {}}
    OTPLabel = {function () {}}
    LogIn = {function () {}}
/>)

    describe('should render auth form', () => {

        it('should render heading "Hi, user" ', () => {
            expect(wrapper.find('.text-info')).toExist
        })

        it('should render Enter code label', () => {
             expect(wrapper.find('.control-label')).toExist
            //  wrapper.find('.control-label').forEach((item, i) => {
            //     expect(item.text()).toEqual('Enter your Google Authentication Code')
            // })
        })

        it('should render input box', () => {
            expect(wrapper.find('form-control')).toExist
        })

        it('should render Sign in button', () => {
            expect(wrapper.find('.btn btn-success')).toExist
            wrapper.find('.btn btn-success').forEach((item, i) => {
                expect(item.text()).toEqual('Sign In')
            })
        })
    })
})

describe('Forgot Password component', () => {

    let handleEvent = {}
    let username = {
        value : '',
        validationState : '',
        helpBlockText : ''
    }

    const wrapper = mount(<ForgotPassword
    username = {username}
    handleEvent = {handleEvent}

    SendForgotPasswordLink= {function () {}}
    />)

})


describe('ConfirmEmailSent component', () => {

    const wrapper = mount(<ConfirmEmailSent
        RedirectToLogin = {function () {}}
    />)

    
})