const logger = require('../lib/logger');
const config = require('../../project.config')
const port = config.www_server_port || '3000';
const host = config.www_server_host;

logger.info('Starting server...')
require('../../server/main').listen(port, () => {
    logger.success(`Server is now running at http://${host}:${port}.`)
})
