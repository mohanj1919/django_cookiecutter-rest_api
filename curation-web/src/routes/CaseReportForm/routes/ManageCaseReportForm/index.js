import { injectReducer } from '../../../../store/reducers'

export default (store) => ({
  path: 'managecasereportform(/:crfId)',
  getComponent({params: {crfId}}, cb) {
    require.ensure([], (require) => {
      const CaseReportForms = require('./containers/ManageCaseReportFormContainer').default
      const reducer = require('./modules/manageCaseReportForm').default

      /*  Add the reducer to the store on key 'managecasereportform'  */
      injectReducer(store, { key: 'managecasereportform', reducer })

      /*  Return getComponent   */
      cb(null, CaseReportForms)

      /* Webpack named bundle   */
    }, 'managecasereportform')
  }
})
