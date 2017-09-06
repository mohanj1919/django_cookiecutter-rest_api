import React from 'react'
import { shallow, mount } from 'enzyme'
import { handleEvent,
    LogIn,
    Authenticate,
    SendForgotPasswordLink,
    ForgotPassword,
    HideBanner,
    RedirectToLogin,
    default as loginReducer } from '../../../../src/routes/Login/modules/login'
import { ValidateUserToken,
    USER_LOG_IN,
    USERNAME_CHANGED,
    TOGGLE_LOGGEDIN_ROLE,
    USER_ROLE } from '../../../../src/modules/global.js'
import expect, { createSpy, spyOn, isSpy } from 'expect'
import axios from '../../../../src/lib/axios'
import config from '../../../../src/config'
import thunk from 'redux-thunk'

describe('Login Route Actions', () => {
    let actionsCreators = {
        handleEvent,
        LogIn,
        Authenticate,
        SendForgotPasswordLink,
        ForgotPassword,
        HideBanner,
        RedirectToLogin,
        ValidateUserToken
    }
    let actions = {
        INPUT_CHANGE: 'INPUT_CHANGE',
        CLEAR_USER: 'CLEAR_USER',
        AUTH_GOOGLE: 'AUTH_GOOGLE',
        VALIDATE_INPUT: 'VALIDATE_INPUT',
        INVALID_AUTH_CODE: 'INVALID_AUTH_CODE',
        INVALID_EMAIL: 'INVALID_EMAIL',
        TOGGLE_NOTIFICATION: 'TOGGLE_NOTIFICATION',
        HIDE_BANNER: 'HIDE_BANNER',
        SET_PROP: 'SET_PROP'
    }
    it('should navigate to login page, on validating user token ', () => {
        var validateUserTokenSpy = expect.spyOn(actionsCreators, 'ValidateUserToken')
        actionsCreators.ValidateUserToken();
        expect(validateUserTokenSpy).toHaveBeenCalled()
    })
    it('should have an all action creators', () => {
        expect(actionsCreators).toExist
    })
    it('Testing logIn function', () => {
        const logInfunc = actionsCreators.LogIn()
        expect(logInfunc).toBeA('function')
        const dispatch = expect.createSpy()
        const getState = () => ({
            Login: {
                username: {
                    value: ''
                },
                password: {
                    value: ''
                },
                isValidInput: true
            }
        })
        logInfunc(dispatch, getState)
        expect(dispatch).toHaveBeenCalledWith({ type: actions.VALIDATE_INPUT })
        const expectedActions = [
            { type: USER_LOG_IN, payload: true }
        ];
    //     const store = mockStore({
    //         Login: {
    //             username: {
    //                 value: ''
    //             },
    //             password: {
    //                 value: ''
    //             },
    //             isValidInput: true
    //         }
    //     });

    // })
    it('Testing Authenticate function', () => {
        const authenticatefunc = actionsCreators.Authenticate()
        expect(authenticatefunc).toBeA('function')
        const dispatch = expect.createSpy()
        const getState = () => ({
            Login: {
                username: {
                    value: ''
                },
                password: {
                    value: ''
                },
                isValidInput: true,
                authCode: {
                    value: false
                }
            }
        })
        authenticatefunc(dispatch, getState)
        expect(dispatch).toHaveBeenCalledWith({ type: actions.INVALID_AUTH_CODE,payload:'Enter Auth Code' })
        
    })

})

describe('Login Reducer', () => {
    const initialState = {
        username: {
            value: '',
            validationState: '',
            helpBlockText: ''
        },
        password: {
            value: '',
            validationState: '',
            helpBlockText: ''
        },
        authCode: {
            value: '',
            validationState: ''

        },
        message: '',
        currentPage: 'AuthOne',
        isValidInput: false,
        banner: {
            showBanner: false,
            showTime: 3000,
            showType: 'error',
            showMessage: 'Invalid Login Attempt'
        }
    }
    it('Should be a function', () => {
        expect(loginReducer).toBeA('function');
    });

    it('should return the default state', () => {
        expect(loginReducer(undefined, {})).toEqual(initialState)
    })
})
})