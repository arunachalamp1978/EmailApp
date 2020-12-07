const MailGun    = require('../../../src/services/email/MailGun');
const config     = require('../../../config');
const should     = require('should');
const sinon      = require('sinon');
const request    = require('request');

describe('Integration', () => {

  const mailGun = new MailGun('Mailgun - TEST');
  let sandbox = null;

  describe('Email', () => {
    describe('MailGun', () => {

      beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.spy(request, 'post');
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('should send an email successfully through MailGun', (done) => {
        const { protocol, url, privateKey, domain, fromAddress } = config.emailProviders.mailGun;
        const to = ['diegogadens+mailguntest@gmail.com'];
        const subject = 'Integration test';
        const message = 'This email has been sent as part of an integration test with MailGun.';

        mailGun.sendEmail(to, null, null, subject, message, (err, response) => {
          should.not.exist(err);
          sinon.assert.calledWith(request.post, {
            url:`${protocol}api:${privateKey}@${url}/${domain}/messages`,
            timeout: config.emailProviders.timeoutInMs,
            form: {
              from: fromAddress,
              to: `<${to[0]}>`,
              subject: subject,
              text: message,
            }
          });
          response.code.should.eql(200);
          done();
        });
      });

      it('should receive an error response from MailGun', (done) => {
        const { protocol, url, privateKey, domain, fromAddress } = config.emailProviders.mailGun;
        const to = ['thisEmailIsNotAllowed@gmail.com'];
        const subject = 'Subject';
        const message = 'The message';

        mailGun.sendEmail(to, null, null, subject, message, (err, response) => {
          should.exist(err);
          sinon.assert.calledWith(request.post, {
            url:`${protocol}api:${privateKey}@${url}/${domain}/messages`,
            timeout: config.emailProviders.timeoutInMs,
            form: {
              from: fromAddress,
              to: `<${to[0]}>`,
              subject: subject,
              text: message,
            }
          });

          err.error.code.should.eql(400);
          done();
        });
      });
    });
  });
});
