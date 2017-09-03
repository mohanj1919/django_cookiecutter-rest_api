import { injectReducer } from '../../store/reducers'
import ProjectsConfigureRoute from './routes/Configure';
import ProjectsList from './routes/ProjectsList';
import Projects from './components/Projects.js';

export default (store) => ({
  path: 'projects',
  component: Projects,
  indexRoute: ProjectsList(store),
  childRoutes: [
    ProjectsConfigureRoute(store)
  ],
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      const Projects = require('./containers/ProjectsContainer').default
      const reducer = require('./modules/projects').default

      injectReducer(store, { key: 'projects', reducer })
      cb(null, Projects)
    }, 'projects')
  }
})
