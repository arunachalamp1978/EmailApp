const config = require('../../../config');
const redis = require('../../redis');

let redisClient = null;

exports.pushEmailJob = (emailJob, callback) => {
  redisClient = redis.client();
  redisClient.rpush(
    config.redis.emailJobsQueueName,
    JSON.stringify(emailJob),
    (err, response) => {
      if(err)
        callback(err);
      else
        callback(null, response);
    }
  );
};

exports.popEmailJob = (callback) => {
  redisClient = redis.client();

  redisClient.rpop(
    config.redis.emailJobsQueueName,
    (err, response) => {
      if(err)
        callback(err);
      else
        callback(null, JSON.parse(response));
    }
  );
};
