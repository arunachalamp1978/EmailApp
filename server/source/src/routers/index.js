const publicRoutes = require('./public');

exports.configureRoutes = server =>
  publicRoutes.init(server);
