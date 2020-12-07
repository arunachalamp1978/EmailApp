const nconf = require('nconf');
const path  = require('path');

const getConfigFileName = () =>
  (process.env.NODE_ENV || 'development') + '.json';

const file = path.join(__dirname, getConfigFileName());

module.exports = nconf.argv()
  .env()
  .file({ file })
  .get();
