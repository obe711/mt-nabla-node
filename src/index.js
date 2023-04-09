const { startServer } = require("./server");
const config = require("./config/config");
const logger = require("./config/logger")


startServer(config.nablaPort).then((server) => {
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
