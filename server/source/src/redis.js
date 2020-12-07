const redis = require('redis');
const log   = require('./log');

let client = null;

exports.setClient = (port, host, callback) => {
  client = redis.createClient(port, host);
  client.on('error', (error) => {
    log.error(error);
    return callback(error);
  });
  client.on('connect', () => {
    log.info('Redis connected!');
    return callback(null, client);
  });
};

exports.client = () => {
  if (!client) {
    log.info('Redis client not configured');
    return;
  }

  return client;
};

exports.configured = () => client !== null;
