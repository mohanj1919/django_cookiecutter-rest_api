import { injectReducer } from '../../store/reducers'

export default (store) => ({
  path: 'questions',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      const Questions = require('./containers/QuestionsContainer').default
      const reducer = require('./modules/questions').default

      /*  Add the reducer to the store on key 'question'  */
      injectReducer(store, { key: 'question', reducer })

      /*  Return getComponent   */
      cb(null, Questions)

      /* Webpack named bundle   */
    }, 'questions')
  }
})
