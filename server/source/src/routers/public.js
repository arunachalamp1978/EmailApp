const validation       = require('../validation');
const emailController  = require('../controllers/email-controller');
const statusController = require('../controllers/status-controller');
const routeMounter     = require('./mounter');

exports.init = (server) => {
  router = routeMounter.mount(server);

  router.get({
    name: 'Status',
    path: '/status',
    handler: statusController.get
  });

  router.post({
    name: 'Send email',
    path: '/email',
    validate: validation.email.request,
    validationErrorHandler: validation.email.errorHandler,
    handler: emailController.post
  });
};
