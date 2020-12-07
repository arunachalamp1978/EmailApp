const SendGrid   = require('../../../src/services/email/SendGrid');
const config     = require('../../../config');
const should     = require('should');
const sinon      = require('sinon');
const request    = require('request');

describe('Services', () => {

  const sendGrid = new SendGrid('Sendgrid - TEST');
  let sandbox = null;

  describe('Email', () => {
    describe('SendGrid', () => {

      beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(request, 'post');
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('should send an email successfully through SendGrid', (done) => {
        request.post.yields(null, {statusCode: 202}, 'SendGrid response');

        const { url, apiKey, fromAddress } = config.emailProviders.sendGrid;
        const to = ['diegogadens@gmail.com'];
        const subject = 'Subject';
        const message = 'The message';

        sendGrid.sendEmail(to, null, null, subject, message, (err, response) => {
          should.not.exist(err);
          sinon.assert.calledWith(request.post, {
            url:`${url}`,
            timeout: config.emailProviders.timeoutInMs,
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            json: {
              personalizations:[{
                to: [{ email: to[0]}],
                subject: subject
              }],
              from: { email: fromAddress },
              content: [{
                type: 'text/plain',
                value: message
              }]
            }
          });
          response.should.eql({
            code: 202,
            message: 'SendGrid response'
          });
          done();
        });
      });

      it('should receive an error response from SendGrid', (done) => {
        request.post.yields(null, {statusCode: 401}, 'SendGrid response');

        const { url, apiKey, fromAddress } = config.emailProviders.sendGrid;
        const to = ['diegogadens@gmail.com'];
        const subject = 'Subject';
        const message = 'The message';

        sendGrid.sendEmail(to, null, null, subject, message, (err, response) => {
          should.exist(err);
          sinon.assert.calledWith(request.post, {
            url:`${url}`,
            timeout: config.emailProviders.timeoutInMs,
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            json: {
              personalizations:[{
                to: [{ email: to[0]}],
                subject: subject
              }],
              from: { email: fromAddress },
              content: [{
                type: 'text/plain',
                value: message
              }]
            }
          });

          err.should.eql({
            error:{
              code:401,
              message: 'SendGrid response'
            }
          });
          done();
        });
      });

      it('should receive an http error while trying to send a request to mailgun', (done) => {
        request.post.yields('some http error');

        const  { url, apiKey, fromAddress } = config.emailProviders.sendGrid;
        const to = ['diegogadens@gmail.com'];
        const subject = 'Subject';
        const message = 'The message';

        sendGrid.sendEmail(to, null, null, subject, message, (err, response) => {
          should.exist(err);
          err.should.eql('some http error');
          done();
        });
      });
    });
  });
});
