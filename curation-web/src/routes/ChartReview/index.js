import { injectReducer } from '../../store/reducers'

export default (store) => ({
  path : 'chartreview/:projectId/:cohortId(/:patientId)(/:curatorId)',
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const ChartReview = require('./containers/ChartReviewContainer').default
      const reducer = require('./modules/ChartReview').default

      /*  Add the reducer to the store on key 'chartreview'  */
      injectReducer(store, { key: 'chartreview', reducer })

      /*  Return getComponent   */
      cb(null, ChartReview)

    /* Webpack named bundle   */
    }, 'chartreview')
  }
})
