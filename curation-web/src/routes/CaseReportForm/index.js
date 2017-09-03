import { injectReducer } from '../../store/reducers'
import ManageCaseReportForm from './routes/ManageCaseReportForm'
export default (store) => ({
  path: 'casereportform',
  childRoutes: [
    ManageCaseReportForm(store),
  ],
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      const CaseReportForms = require('./containers/CaseReportFormContainer').default
      const reducer = require('./modules/caseReportForm').default

      /*  Add the reducer to the store on key 'casereportform'  */
      injectReducer(store, { key: 'casereportform', reducer })

      /*  Return getComponent   */
      cb(null, CaseReportForms)

      /* Webpack named bundle   */
    }, 'casereportform')
  }
})
