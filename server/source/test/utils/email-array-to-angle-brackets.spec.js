const emailsParser = require('../../src/utils/email-array-to-angle-brackets');
const should       = require('should');

describe('Utils', () => {
  describe('Convert array of emails to angle brackets', () => {

    it('it should convert an empty array to a null string', (done) => {
      emailArray = [];
      expected = null;

      should(emailsParser(emailArray)).eql(expected);
      return done();
    });

    it('it should convert an array with one email to the correct angle brackets syntax', (done) => {
      emailArray = ['test@mail.com'];
      expected = '<test@mail.com>';

      should(emailsParser(emailArray)).eql(expected);
      return done();
    });

    it('it should convert an array with 2 emails to the correct angle brackets syntax', (done) => {
      emailArray = ['test@mail.com', 'test2@mail.com'];
      expected = '<test@mail.com>, <test2@mail.com>';

      should(emailsParser(emailArray)).eql(expected);
      return done();
    });

    it('it should convert an array with 3 emails to the correct angle brackets syntax', (done) => {
      emailArray = ['test@mail.com', 'test2@mail.com', 'test3@mail.com'];
      expected = '<test@mail.com>, <test2@mail.com>, <test3@mail.com>';

      should(emailsParser(emailArray)).eql(expected);
      return done();
    });

  });
});
