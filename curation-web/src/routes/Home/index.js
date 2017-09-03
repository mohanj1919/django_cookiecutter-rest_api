import { injectReducer } from '../../store/reducers'

export default (store) => ({
  path: '',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      const Home = require('./containers/HomeContainer').default
      const reducer = require('./modules/home').default

      injectReducer(store, { key: 'home', reducer })

      /*  Return getComponent   */
      cb(null, Home)

      /* Webpack named bundle   */
    }, 'home')
  }
})
