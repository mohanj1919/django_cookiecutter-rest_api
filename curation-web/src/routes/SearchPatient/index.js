import { injectReducer } from '../../store/reducers'
import ShowPatients from './routes/ShowPatients';
import SearchPatients from './components/SearchPatients.js';

export default (store) => ({
  path: 'search',
  component: SearchPatients,
  indexRoute: ShowPatients(store),
  childRoutes: [
    
  ],
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      const Projects = require('./containers/SearchPatientsContainer').default
      const reducer = require('./modules/searchpatients').default

      injectReducer(store, { key: 'searchpatients', reducer })
      cb(null, Projects)
    }, 'searchpatients')
  }
})
