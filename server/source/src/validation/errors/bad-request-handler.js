/* strummer-middleware will call next(err) in case of validation errors.
In Express/Restify that means we also need to set up an error handler.*/

module.exports = (strummerError, req, res, next) => {

  const errorResponse = {
    code: 400,
    message: 'Bad request',
    details: strummerError.details
  };

  res.send(400, errorResponse);
};
