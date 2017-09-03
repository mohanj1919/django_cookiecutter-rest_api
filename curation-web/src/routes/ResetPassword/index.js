import {injectReducer} from '../../store/reducers'

export default(store) => ({
    path: 'resetpassword/:uuid',
    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            const ResetPassword = require('./containers/ResetPasswordContainer').default
            const reducer = require('./modules/resetpassword').default

            injectReducer(store, {
                key: 'resetpassword',
                reducer
            })

            /*  Return getComponent   */
            cb(null, ResetPassword)

            /* Webpack named bundle   */
        }, 'resetpassword')
    }
})
