import { injectReducer } from '../../store/reducers'

export default (store) => ({
  path : 'emailtemplatedesigner',
  getComponent (nextState, cb) {
    require.ensure([], (require) => {
      const TemplateDesigner = require('./containers/EmailTemplateDesignerContainer').default
      const reducer = require('./modules/emailTemplateDesigner').default

      /*  Add the reducer to the store on key 'chartreview'  */
      injectReducer(store, { key: 'emailtemplatedesigner', reducer })

      /*  Return getComponent   */
      cb(null, TemplateDesigner)

    /* Webpack named bundle   */
    }, 'emailtemplatedesigner')
  }
})
