const dgram = require('node:dgram');
const logger = require("./config/logger");
const NablaTx = require("../../mt-nabla-tx");
const config = require("./config/config");

const nablaTx = new NablaTx({ logger, port: config.hub.port, ip: config.hub.ip });

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

function startServer(port) {
  logger.info("starting server");
  const server = createServer();

  server.on('message', (msg, rinfo) => {
    logger.info(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    nablaTx.accessLog(msg);
  });

  server.bind(port);

  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      logger.error('Address in use, retrying...');
      setTimeout(() => {
        startServer(port);
      }, 1000);
    }
  });

  return Promise.resolve(server);
}

module.exports = {
  startServer
}