const dgram = require('node:dgram');
const logger = require("./config/logger");
const config = require("./config/config");

/**
 * Create Socket server for access logs
 * @returns {node:dgram}
 */
function createServer() {
  const server = dgram.createSocket('udp4');

  server.on("connect", () => {
    logger.info("conneced");
  })

  server.on('listening', () => {
    const address = server.address();
    logger.info(`server listening ${address.address}:${address.port}`);
  });

  return server;
}

/**
 * Start Socket server for access logs
 * @param {*} messageHandler 
 * @returns {Promise<node:dgram>}
 */
function startServer(messageHandler) {
  logger.info("starting access log server");
  const server = createServer();

  server.on('message', (msg, rinfo) => {
    logger.info(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    messageHandler(msg);
  });

  server.bind(config.nablaPort);

  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      logger.error('Address in use, retrying...');
      setTimeout(() => {
        startServer(config.nablaPort);
      }, 1000);
    }
  });

  return Promise.resolve(server);
}

module.exports = {
  startServer
}