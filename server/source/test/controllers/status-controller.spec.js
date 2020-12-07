const testServer = require('../../src/server');
const request = require('supertest');
const should = require('should');
const server = testServer.createServer();

describe('Status', () => {
  describe('/GET status', () => {
    it('it should GET the status', (done) => {
      request(server)
        .get('/status')
        .expect(200)
        .end((err, res) => {
          if(err)
            return done(err);
          should(res.body).eql('OK');
          return done();
        });
    });
  });
});
