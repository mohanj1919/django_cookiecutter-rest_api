import { injectReducer } from '../../../../store/reducers'

export default (store) => ({
  path: '',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      const ShowPatients = require('./containers/ShowPatientsContainer').default
      const reducer = require('./modules/showpatients').default

      /*  Add the reducer to the store on key 'managecasereportform'  */
      injectReducer(store, { key: 'showpatients', reducer })

      /*  Return getComponent   */
      cb(null, ShowPatients)

      /* Webpack named bundle   */
    }, 'showpatients')
  }
})
