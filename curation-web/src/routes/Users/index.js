import { injectReducer } from '../../store/reducers'
import Profile from './routes/Profile';
import Users from './components/Users.js';

export default (store) => ({
  path: 'Users',
  component: Users,
  childRoutes: [
    Profile(store)
  ],
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      const Users = require('./containers/UsersContainer').default
      const reducer = require('./modules/users').default

      injectReducer(store, { key: 'users', reducer })
      cb(null, Users)
    }, 'Users')
  }
})
