import React from 'react'
import { connect } from 'react-redux';
import { default as Login } from '../../../../src/routes/Login/components/Login'
import { mapDispatchToProps, mapStateToProps } from '../../../../src/routes/Login/containers/LoginContainer'
import { handleEvent, LogIn, Authenticate, SendForgotPasswordLink, ForgotPassword, HideBanner, RedirectToLogin } from '../../../../src/routes/Login/modules/login.js'
import { ValidateUserToken } from '../../../../src/modules/global.js'
import expect from 'expect'
import Immutable from 'immutable'

describe('Login Container', () => {
    let state
    beforeEach(() => {
        state = {
            global: Immutable.fromJS({
                isAuthenticated: false
            }),
            Login: {
                InvalidLoginMessage: '',
                show_resend_link: false
            }
        }
    })

    it('should have all the required methods in mapDispatchToProps object', () => {
        expect(mapDispatchToProps).toEqual({
            handleEvent, LogIn, Authenticate, SendForgotPasswordLink, ForgotPassword, HideBanner, RedirectToLogin, ValidateUserToken
        })
    })
    it('should have the correct mapStateToProps function', () => {
        expect(mapStateToProps(state).isAuthenticated).toEqual(false)
        expect(mapStateToProps(state).InvalidLoginMessage).toEqual('')
        expect(mapStateToProps(state).show_resend_link).toEqual(false)
    })

})