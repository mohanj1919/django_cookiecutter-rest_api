const NODE_ENV = process.env.NODE_ENV || 'production';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || '3000';
const URL = process.env.URL || 'http://localhost:8000';

console.log(process.env.URL)
module.exports = {
    /** The environment to use when building the project */
    env: NODE_ENV,
    /** The full path to the project's root directory */
    basePath: __dirname,
    /** The name of the directory containing the application source code */
    srcDir: 'src',
    /** The file name of the application's entry point */
    main: 'main',
    /** The name of the directory in which to emit compiled assets */
    outDir: 'static',
    /** The base path for all projects assets (relative to the website root) */
    publicPath: '/static/',
    /** Whether to generate sourcemaps */
    sourcemaps: true,
    /** A hash map of keys that the compiler should treat as external to the project */
    externals: {},
    /** A hash map of variables and their values to expose globally */
    globals: {},
    /** Whether to enable verbose logging */
    verbose: false,
    /** The list of modules to bundle separately from the core application code */
    vendors: [
        'react',
        'react-dom',
        'redux',
        'react-redux',
        'redux-thunk',
        'react-router',
    ],
    www_server_port: PORT,
    www_server_host: HOST,
    api_url: URL
}
