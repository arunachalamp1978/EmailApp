const config = require('../config');
const log    = require('./log');
const server = require('./server');
const redis  = require('./redis');
const worker = require('./workers/worker');


let serverRunning = false;
let app = null;

const exit = (code) => {
  if (app && serverRunning) {
    return app.seppuku();
  } else {
    return process.exit(code);
  }
};

process.on('uncaughtException', (err) => {
  log.error('Process uncaught exception, shutting down the server');
  log.error(err);
  return exit(1);
});

process.on('SIGINT', () => {
  log.info(' -> SIGINT (Ctrl-C) received');
  return exit(0);
});

process.on('SIGTERM', () => {
  log.info(' -> SIGTERM (kill) received');
  return exit(0);
});

//Mandatory Redis connection
redis.setClient(config.redis.port, config.redis.host, (err, client) => {
  if (!redis.configured() || (err != null)) {
    log.error('Cannot connect to Redis, exiting');
    return exit('SIGTERM');
  }

  app = server.createServer();

  app.listen(config.serverPort, () => {
    log(`listening at ${config.serverPort}`);
    return serverRunning = true;
  });

  worker.init();

});
