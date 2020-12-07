const config    = require('../../../config');
const redis     = require('../../../src/redis');
const queue     = require('../../../src/services/queue/job-manager');
const fakeRedis = require('fakeredis').createClient();
const should    = require('should');
const sinon     = require('sinon');


describe('Services', () => {

  let sandbox = null;

  describe('Redis', () => {
    describe('Queuing', () => {

      beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(redis, 'client');
        sandbox.spy(fakeRedis, 'rpush');
        sandbox.spy(fakeRedis, 'rpop');
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('should PUSH an POP an object into the Redis queue', (done) => {
        redis.client.returns(fakeRedis);

        const job = {job: 'some job'};

        queue.pushEmailJob(job, (err, response) => {
          should.not.exist(err);
          sinon.assert.calledWith(fakeRedis.rpush, config.redis.emailJobsQueueName,
            JSON.stringify(job)
          );
          response.should.eql(1);
          queue.popEmailJob((err, response) => {
            should.not.exist(err);
            sinon.assert.calledWith(fakeRedis.rpop, config.redis.emailJobsQueueName);
            response.should.eql(job);
            done();
          });
        });
      });

    });
  });
});
