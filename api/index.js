// let mainApp = require(./app)
exports.router = function (app) {
  // app.get('/api_connector/logsufer', mainApp.checkPermission(), get)
  app.get('/api_connector/logsufer', get)
  app.post('/api_connector/logsufer', post)
  app.put('/api_connector/logsufer', put)
  app.delete('/api_connector/logsufer', del)
}

function get (req, res) {
  res.send({logsufer : 'get ok'})
}

function post (req, res) {
  res.send({logsufer : 'post ok'})
}

function put (req, res) {
  res.send({logsufer : 'put ok'})
}

function del (req, res) {
  res.send({logsufer : 'delete ok'})
}