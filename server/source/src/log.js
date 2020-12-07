//TODO Integrate with a proper log tool, such as Splunk

module.exports = content =>
  console.log(content);

module.exports.error = content =>
  console.error(content);

module.exports.info = content =>
  console.info(content);
