import { injectReducer } from '../../store/reducers'

export default (store) => ({
  path : 'settings',
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const AdminSettings = require('./containers/AdminSettingsContainer').default
      const reducer = require('./modules/adminSettings').default

      /*  Add the reducer to the store on key 'chartreview'  */
      injectReducer(store, { key: 'adminsettings', reducer })

      /*  Return getComponent   */
      cb(null, AdminSettings)

    /* Webpack named bundle   */
    }, 'adminsettings')
  }
})
