const async = require('async')
const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const appPath = path.dirname(path.dirname(__dirname))
const models = require(appPath + '/models')

const patchMgr = require('./lib/patchMgr')

// console.warn('patch == > appPath :', appPath)

exports.init = function() {}

exports.postConnectorInformation = function(param = {}) {
  return new Promise(function(resolve, reject) {
    async.waterfall([patchMgr.getConfig, patchMgr.verifyConfig], function(err, result) {
      console.log('=================> Hook : ', result)
      resolve()
    })
  })
}
