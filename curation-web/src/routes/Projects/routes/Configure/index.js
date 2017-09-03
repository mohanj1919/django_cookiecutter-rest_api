import { injectReducer } from 'store/reducers';

export default (store) => ({
  path: 'configure(/:cohortId)',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      const Add = require('./containers/ProjectsConfigureContainer').default;
      const reducer = require('./modules/projectsconfigure').default;

      injectReducer(store, { key: 'projectsconfigure', reducer });

      cb(null, Add);

    }, 'projectsconfigure');
  }
});
