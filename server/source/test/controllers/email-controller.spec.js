const testServer = require('../../src/server');
const queue      = require('../../src/services/queue/job-manager');
const request    = require('supertest');
const should     = require('should');
const sinon      = require('sinon');
const server     = testServer.createServer();

describe('Email', () => {
  let sandbox = null;
  const redisJobId = 123;
  const expectedResponse = {
    code: 202,
    message: 'Your email has been queued and will be sent shortly',
    emailJobId: redisJobId
  };

  describe('/POST email', () => {

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(queue, 'pushEmailJob');

      queue.pushEmailJob.yields(null, redisJobId);
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('Valid request', () => {
      it('it should accept a request to send an email', (done) => {
        let emailData = {
          to: ['test@email.com'],
          subject: 'Sample subject',
          message: 'Hi! This is a test'
        };
        request(server)
          .post('/email')
          .send(emailData)
          .expect(202)
          .end((err, res) => {
            if(err)
              return done(err);
            sinon.assert.calledWith(queue.pushEmailJob, {
              email: {
                to: emailData.to,
                cc: undefined,
                bcc: undefined,
                subject: emailData.subject,
                message: emailData.message
              },
              deliveryAttempts: []
            });
            should(res.body).eql(expectedResponse);
            return done();
          });
      });

      it('it should accept a request to send an email with no subject', (done) => {
        let emailData = {
          to: ['test@email.com'],
          message: 'Hi! This is a test'
        };
        request(server)
          .post('/email')
          .send(emailData)
          .expect(202)
          .end((err, res) => {
            if(err)
              return done(err);
            sinon.assert.calledWith(queue.pushEmailJob, {
              email: {
                to: emailData.to,
                cc: undefined,
                bcc: undefined,
                subject: undefined,
                message: emailData.message
              },
              deliveryAttempts: []
            });
            should(res.body).eql(expectedResponse);
            return done();
          });
      });

      it('it should accept a request to send an email with CC', (done) => {
        let emailData = {
          to: ['test@email.com'],
          cc: ['copied@email.com'],
          subject: 'Sample subject',
          message: 'Hi! This is a test'
        };
        request(server)
          .post('/email')
          .send(emailData)
          .expect(202)
          .end((err, res) => {
            if(err)
              return done(err);
            sinon.assert.calledWith(queue.pushEmailJob, {
              email: {
                to: emailData.to,
                cc: emailData.cc,
                bcc: undefined,
                subject: emailData.subject,
                message: emailData.message
              },
              deliveryAttempts: []
            });
            should(res.body).eql(expectedResponse);
            return done();
          });
      });

      it('it should accept a request to send an email with CC and no subject', (done) => {
        let emailData = {
          to: ['test@email.com'],
          cc: ['copied@email.com'],
          message: 'Hi! This is a test'
        };
        request(server)
          .post('/email')
          .send(emailData)
          .expect(202)
          .end((err, res) => {
            if(err)
              return done(err);
            sinon.assert.calledWith(queue.pushEmailJob, {
              email: {
                to: emailData.to,
                cc: emailData.cc,
                bcc: undefined,
                subject: emailData.subject,
                message: emailData.message
              },
              deliveryAttempts: []
            });
            should(res.body).eql(expectedResponse);
            return done();
          });
      });

      it('it should accept a request to send an email with CC and BCC', (done) => {
        let emailData = {
          to: ['test@email.com'],
          cc: ['copied@email.com'],
          bcc: ['blind-copied@email.com'],
          subject: 'Sample subject',
          message: 'Hi! This is a test'
        };
        request(server)
          .post('/email')
          .send(emailData)
          .expect(202)
          .end((err, res) => {
            if(err)
              return done(err);
            sinon.assert.calledWith(queue.pushEmailJob, {
              email: {
                to: emailData.to,
                cc: emailData.cc,
                bcc: emailData.bcc,
                subject: emailData.subject,
                message: emailData.message
              },
              deliveryAttempts: []
            });
            should(res.body).eql(expectedResponse);
            return done();
          });
      });
    });

    describe('Invalid requests', () => {
      it('it should reject a request to send an email if the email is an empty array', (done) => {
        let emailData = {
          to: [],
          subject: 'Sample subject',
          message: 'Hi! This is a test'
        };
        request(server)
          .post('/email')
          .send(emailData)
          .expect(400)
          .end((err, res) => {
            if(err)
              return done(err);
            should(res.body.code).eql(400);
            should(res.body.message).eql('Bad request');
            should(res.body.details).eql([{
              path: 'body.to',
              value: emailData.to,
              message: 'should have at least 1 items'
            }]);
            return done();
          });
      });

      it('it should reject a request to send an email if the email is not inside an array', (done) => {
        let emailData = {
          to: 'testemail.com',
          subject: 'Sample subject',
          message: 'Hi! This is a test'
        };
        request(server)
          .post('/email')
          .send(emailData)
          .expect(400)
          .end((err, res) => {
            if(err)
              return done(err);
            should(res.body.code).eql(400);
            should(res.body.message).eql('Bad request');
            should(res.body.details).eql([{
              path: 'body.to',
              value: emailData.to,
              message: 'should be an array'
            }]);
            return done();
          });
      });

      it('it should reject a request to send an email if the email is invalid', (done) => {
        let emailData = {
          to: ['testemail.com'],
          subject: 'Sample subject',
          message: 'Hi! This is a test'
        };
        request(server)
          .post('/email')
          .send(emailData)
          .expect(400)
          .end((err, res) => {
            if(err)
              return done(err);
            should(res.body.code).eql(400);
            should(res.body.message).eql('Bad request');
            should(res.body.details).eql([{
              path: 'body.to[0]',
              value: emailData.to[0],
              message: 'should be a valid email address'
            }]);
            return done();
          });
      });

      it('it should reject a request to send an email if any of the emails is invalid', (done) => {
        let emailData = {
          to: ['test@email.com', 'test2@email.com', 'testemail.com'],
          subject: 'Sample subject',
          message: 'Hi! This is a test'
        };
        request(server)
          .post('/email')
          .send(emailData)
          .expect(400)
          .end((err, res) => {
            if(err)
              return done(err);
            should(res.body.code).eql(400);
            should(res.body.message).eql('Bad request');
            should(res.body.details).eql([{
              path: 'body.to[2]',
              value: emailData.to[2],
              message: 'should be a valid email address'
            }]);
            return done();
          });
      });

      it('it should reject a request to send an email if the CCed email is not inside an array', (done) => {
        let emailData = {
          to: ['test@email.com'],
          cc: 'copied@email.com',
          subject: 'Sample subject',
          message: 'Hi! This is a test'
        };
        request(server)
          .post('/email')
          .send(emailData)
          .expect(400)
          .end((err, res) => {
            if(err)
              return done(err);
            should(res.body.code).eql(400);
            should(res.body.message).eql('Bad request');
            should(res.body.details).eql([{
              path: 'body.cc',
              value: emailData.cc,
              message: 'should be an array'
            }]);
            return done();
          });
      });

      it('it should reject a request to send an email if the CCed email is an empty array', (done) => {
        let emailData = {
          to: ['test@email.com'],
          cc: [],
          subject: 'Sample subject',
          message: 'Hi! This is a test'
        };
        request(server)
          .post('/email')
          .send(emailData)
          .expect(400)
          .end((err, res) => {
            if(err)
              return done(err);
            should(res.body.code).eql(400);
            should(res.body.message).eql('Bad request');
            should(res.body.details).eql([{
              path: 'body.cc',
              value: emailData.cc,
              message: 'should have at least 1 items'
            }]);
            return done();
          });
      });

      it('it should reject a request to send an email if the CCed email is invalid', (done) => {
        let emailData = {
          to: ['test@email.com'],
          cc: ['copiedemail.com'],
          subject: 'Sample subject',
          message: 'Hi! This is a test'
        };
        request(server)
          .post('/email')
          .send(emailData)
          .expect(400)
          .end((err, res) => {
            if(err)
              return done(err);
            should(res.body.code).eql(400);
            should(res.body.message).eql('Bad request');
            should(res.body.details).eql([{
              path: 'body.cc[0]',
              value: emailData.cc[0],
              message: 'should be a valid email address'
            }]);
            return done();
          });
      });

      it('it should reject a request to send an email if any of the CCed emails is invalid', (done) => {
        let emailData = {
          to: ['test@email.com', 'test2@email.com', 'test3@email.com'],
          cc: ['copied@email.com', 'copied2@email.com', 'copied3email.com'],
          subject: 'Sample subject',
          message: 'Hi! This is a test'
        };
        request(server)
          .post('/email')
          .send(emailData)
          .expect(400)
          .end((err, res) => {
            if(err)
              return done(err);
            should(res.body.code).eql(400);
            should(res.body.message).eql('Bad request');
            should(res.body.details).eql([{
              path: 'body.cc[2]',
              value: emailData.cc[2],
              message: 'should be a valid email address'
            }]);
            return done();
          });
      });

      it('it should reject a request to send an email if the BCCed email is not inside an array', (done) => {
        let emailData = {
          to: ['test@email.com'],
          cc: ['copied@email.com'],
          bcc: 'blind-copied@email.com',
          subject: 'Sample subject',
          message: 'Hi! This is a test'
        };
        request(server)
          .post('/email')
          .send(emailData)
          .expect(400)
          .end((err, res) => {
            if(err)
              return done(err);
            should(res.body.code).eql(400);
            should(res.body.message).eql('Bad request');
            should(res.body.details).eql([{
              path: 'body.bcc',
              value: emailData.bcc,
              message: 'should be an array'
            }]);
            return done();
          });
      });

      it('it should reject a request to send an email if the BCCed email is an empty array', (done) => {
        let emailData = {
          to: ['test@email.com'],
          cc: ['copied@email.com'],
          bcc: [],
          subject: 'Sample subject',
          message: 'Hi! This is a test'
        };
        request(server)
          .post('/email')
          .send(emailData)
          .expect(400)
          .end((err, res) => {
            if(err)
              return done(err);
            should(res.body.code).eql(400);
            should(res.body.message).eql('Bad request');
            should(res.body.details).eql([{
              path: 'body.bcc',
              value: emailData.bcc,
              message: 'should have at least 1 items'
            }]);
            return done();
          });
      });

      it('it should reject a request to send an email if the BCCed email is invalid', (done) => {
        let emailData = {
          to: ['test@email.com'],
          cc: ['copied@email.com'],
          bcc: ['blind-copiedemail.com'],
          subject: 'Sample subject',
          message: 'Hi! This is a test'
        };
        request(server)
          .post('/email')
          .send(emailData)
          .expect(400)
          .end((err, res) => {
            if(err)
              return done(err);
            should(res.body.code).eql(400);
            should(res.body.message).eql('Bad request');
            should(res.body.details).eql([{
              path: 'body.bcc[0]',
              value: emailData.bcc[0],
              message: 'should be a valid email address'
            }]);
            return done();
          });
      });

      it('it should reject a request to send an email if any of the BCCed emails is invalid', (done) => {
        let emailData = {
          to: ['test@email.com', 'test2@email.com', 'test3@email.com'],
          cc: ['copied@email.com', 'copied2@email.com', 'copied3@email.com'],
          bcc: ['blind-copied@email.com', 'blind-copied2@email.com', 'blind-copied3email.com'],
          subject: 'Sample subject',
          message: 'Hi! This is a test'
        };
        request(server)
          .post('/email')
          .send(emailData)
          .expect(400)
          .end((err, res) => {
            if(err)
              return done(err);
            should(res.body.code).eql(400);
            should(res.body.message).eql('Bad request');
            should(res.body.details).eql([{
              path: 'body.bcc[2]',
              value: emailData.bcc[2],
              message: 'should be a valid email address'
            }]);
            return done();
          });
      });

      it('it should reject a request to send an email if it does not contain at least one recipient', (done) => {
        let emailData = {
          subject: 'Sample subject',
          message: 'Hi! This is a test'
        };
        request(server)
          .post('/email')
          .send(emailData)
          .expect(400)
          .end((err, res) => {
            if(err)
              return done(err);
            should(res.body.code).eql(400);
            should(res.body.message).eql('Bad request');
            should(res.body.details).eql([{
              path: 'body.to',
              message: 'should be an array'
            }]);
            return done();
          });
      });

      it('it should reject a request to send an email if the message is not included in the request', (done) => {
        let emailData = {
          to: ['test@email.com'],
          subject: 'Sample subject'
        };
        request(server)
          .post('/email')
          .send(emailData)
          .expect(400)
          .end((err, res) => {
            if(err)
              return done(err);
            should(res.body.code).eql(400);
            should(res.body.message).eql('Bad request');
            should(res.body.details).eql([{
              path: 'body.message',
              message: 'should be a string'
            }]);
            return done();
          });
      });

      it('it should reject a request to send an email if the message is empty', (done) => {
        let emailData = {
          to: ['test@email.com'],
          subject: 'Sample subject',
          message: ''
        };
        request(server)
          .post('/email')
          .send(emailData)
          .expect(400)
          .end((err, res) => {
            if(err)
              return done(err);
            should(res.body.code).eql(400);
            should(res.body.message).eql('Bad request');
            should(res.body.details).eql([{
              path: 'body.message',
              value: emailData.message,
              message: 'should be a string with length >= 1'
            }]);
            return done();
          });
      });

      it('it should reject a request to send an email if it does not contain at least one recipient and a message', (done) => {
        let emailData = {
          subject: 'Sample subject'
        };
        request(server)
          .post('/email')
          .send(emailData)
          .expect(400)
          .end((err, res) => {
            if(err)
              return done(err);
            should(res.body.code).eql(400);
            should(res.body.message).eql('Bad request');
            should(res.body.details).eql([{
              path: 'body.to',
              message: 'should be an array'
            },{
              path: 'body.message',
              message: 'should be a string'
            }]);
            return done();
          });
      });
    });
  });
});
