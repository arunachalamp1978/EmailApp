exports.mount = (server) => {
  return {
    get(opts){
      return server.get(
        opts.path,
        opts.handler
      );
    },
    post(opts){
      return server.post(
        opts.path,
        opts.validate,
        opts.validationErrorHandler,
        opts.handler
      );
    },
    put(opts){
      return server.put(
        opts.path,
        opts.handler
      );
    },
    delete(opts){
      return server.delete(
        opts.path,
        opts.handler
      );
    }
  };
};
