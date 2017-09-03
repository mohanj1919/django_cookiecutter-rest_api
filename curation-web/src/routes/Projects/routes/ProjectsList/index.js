import { injectReducer } from 'store/reducers';

export default (store) => ({
  path: '',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      const ProjectsList = require('./containers/ProjectsListContainer').default;
      const reducer = require('./modules/projectslist').default;

      injectReducer(store, { key: 'projectslist', reducer });

      cb(null, ProjectsList);

    }, 'projectslist');
  }
});
