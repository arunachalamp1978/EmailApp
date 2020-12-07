const restify = require('restify');
const express = require('express');
const seppuku = require('seppuku');
const config  = require('../config');
const routers = require('./routers');
const corsMiddleware = require('restify-cors-middleware');
const app = express();
require("./config/db")(app);

exports.createServer = () => {

  const server = restify.createServer();

  server.use(
    seppuku(server, {
      minDeferralTime: config.shutDownTimeout,
      maxDeferralTime: config.shutDownTimeout,
      trapExceptions: false
    })
  );

  const cors = corsMiddleware({  
    origins: ["*"],
    allowHeaders: ["Authorization"],
    exposeHeaders: ["Authorization"]
  });

  server.on('uncaughtException', (req, res, route, err) =>
    res.send(503, new restify.InternalError('Service not available'))
  );

  server.use(restify.plugins.queryParser());
  server.use(restify.plugins.bodyParser());
  server.pre(cors.preflight);  
  server.use(cors.actual);  

  routers.configureRoutes(server);

  return server;
};
