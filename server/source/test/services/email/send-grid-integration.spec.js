const SendGrid   = require('../../../src/services/email/SendGrid');
const config     = require('../../../config');
const should     = require('should');
const sinon      = require('sinon');
const request    = require('request');

describe('Integration', () => {

  const sendGrid = new SendGrid('Sendgrid - TEST');
  let sandbox = null;

  describe('Email', () => {
    describe('SendGrid', () => {

      beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.spy(request, 'post');
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('should send an email successfully through SendGrid', (done) => {

        const { url, apiKey, fromAddress } = config.emailProviders.sendGrid;
        const to = ['diegogadens@gmail.com'];
        const subject = 'Integration test';
        const message = 'This email has been sent as part of an integration test with Send Grid.';

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
          response.code.should.eql(202);
          done();
        });
      });

      it('should receive an error response from SendGrid', (done) => {

        const { url, apiKey, fromAddress } = config.emailProviders.sendGrid;
        const to = ['diegogadens@gmail.com'];
        const subject = 'Subject';
        const message = 'The message';

        sendGrid.sendEmail([], null, null, subject, message, (err, response) => {
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
                to: [],
                subject: subject
              }],
              from: { email: fromAddress },
              content: [{
                type: 'text/plain',
                value: message
              }]
            }
          });

          err.error.code.should.eql(400);
          done();
        });
      });
    });
  });
});
