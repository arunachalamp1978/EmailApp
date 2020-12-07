const cryptoJS = require('crypto-js');

exports.toBase64 = (string) => {
  return cryptoJS.enc.Base64.stringify(string);
};

exports.HmacSHA256 = (string, key) => {
  return cryptoJS.HmacSHA256(string, key);
};

exports.utf8Encode = (string) =>{
  return cryptoJS.enc.Utf8.parse(string);
};
