import { injectReducer } from '../../store/reducers'

export default (store) => ({
  path: 'userslist',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      const UsersList = require('./containers/UsersListContainer').default
      const reducer = require('./modules/UsersList').default

      /*  Add the reducer to the store on key 'userslist'  */
      injectReducer(store, { key: 'userslist', reducer })

      /*  Return getComponent   */
      cb(null, UsersList)
      /* Webpack named bundle   */
    }, 'UsersList')
  }
})
