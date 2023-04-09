const { startServer } = require("./server");
const config = require("./config/config");
const logger = require("./config/logger");

const NablaTx = require("../../mt-nabla-tx");

const nablaTx = new NablaTx({ logger, port: config.hub.port, ip: config.hub.ip });


const accessMessageHandler = (msg) => {
  nablaTx.accessLog(msg);
}


startServer(accessMessageHandler).then((server) => {

  // build system logger



  const exitHandler = () => {
    if (server) {
      server.close(() => {
        logger.info('Socket Server closed');
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  };

  const unexpectedErrorHandler = (error) => {
    logger.error(`${error}`);
    exitHandler();
  };

  process.on('uncaughtException', unexpectedErrorHandler);
  process.on('unhandledRejection', unexpectedErrorHandler);

  process.on('SIGUSR2', () => {
    logger.info('SOCKET SIGUSR2 received');
    if (server) {
      server.close();
    }
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('SOCKET SIGTERM received');
    if (server) {
      server.close();
    }
  });
});
