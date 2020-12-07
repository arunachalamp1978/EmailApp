let Email = require("../services/data/email-model");

exports.get = async (req, res, next) => {

  try {

     Email.find()
    .then(docs => res.send(200, docs))
    .catch(err => res.send(500, err));
     next();

} catch (err) {
    console.log(err)
    res.send(500, {
        error: err
    });
    return next();
}
 
};
