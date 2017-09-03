import merge from 'lodash/merge';

// Default Config
const config = require('./default').default;

// Inject config based on NODE_ENV.
if (['development', 'test', 'production'].includes(process.env.NODE_ENV)) {
  const override = require(`./${process.env.NODE_ENV}`).default;
  merge(config, override);
}

export default config;
