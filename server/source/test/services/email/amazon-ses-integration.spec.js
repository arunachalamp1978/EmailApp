const AmazonSES  = require('../../../src/services/email/AmazonSES');
const config     = require('../../../config');
const should     = require('should');
const sinon      = require('sinon');
const request    = require('request');

describe('Integration', () => {

  const amazonSES = new AmazonSES('Amazon SES - TEST');
  let sandbox = null;

  describe('Email', () => {
    describe('Amazon SES', () => {

      beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.spy(request, 'post');
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('should send an email successfully', (done) => {
        const { url, accesKeyId } = config.emailProviders.amazonSES;
        const to = ['diegogadens@gmail.com'];
        const subject = 'Integration test';
        const message = 'This email has been sent as part of an integration test with Amazon SES.';

        amazonSES.sendEmail(to, null, null, subject, message, (err, response) => {
          should.not.exist(err);
          response.code.should.eql(200);
          done();
        });
      });

    });
  });
});
