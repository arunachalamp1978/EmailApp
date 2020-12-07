const mongoose = require('mongoose')
const dbConfig = require('../../config/mongoDB');

module.exports = function (app) {
  mongoose.connect(dbConfig.db, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
  }).then(res => console.log('connected')).catch(err => console.log(err))
  mongoose.Promise = global.Promise

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
  process.on('SIGHUP', cleanup)

  if (app) {
    app.set('mongoose', mongoose)
  }
}

function cleanup () {
  mongoose.connection.close(function () {
    process.exit(0)
  })
}
