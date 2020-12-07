const crypto = require('../../src/utils/crypto');
const should = require('should');

describe('Utils', () => {
  describe('Crypto', () => {

    it('it should encrypt a string to a 32-bit word array with HmacSHA256 algorithm', (done) => {
      string = 'Hello';
      expected = JSON.stringify({
        words: [
          -955539635,
          1717294633,
          1957677109,
          -2099347186,
          1923357272,
          -612186824,
          -1445514039,
          644690462
        ],
        sigBytes: 32
      });

      should(JSON.stringify(crypto.HmacSHA256(string, 'key'))).eql(expected);
      return done();
    });

    it('it should encode a string to a 32-bit word array with utf8', (done) => {
      string = 'Hello';
      expected = JSON.stringify({
        words: [
          1214606444,
          1862270976
        ],
        sigBytes: 5
      });

      should(JSON.stringify(crypto.utf8Encode(string))).eql(expected);
      return done();
    });

    it('should encode a a 32-bit word array with base64 algorithm', (done) => {
      string = crypto.utf8Encode('Hello this is a string');
      expected = 'SGVsbG8gdGhpcyBpcyBhIHN0cmluZw==';

      should(crypto.toBase64(string)).eql(expected);
      return done();
    });

  });
});
