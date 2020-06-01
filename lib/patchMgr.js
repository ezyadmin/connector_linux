const _ = require('lodash')
const mongoose = require('mongoose')
const path = require('path')
const fs = require('fs')
const appPath = path.dirname(path.dirname(__dirname))

const LLTDPath = path.dirname(__dirname) + '/triggers'
console.log('LLTDPath : ', LLTDPath)

// const models = require(appPath + '/models')
const models = require(path.dirname(path.dirname(path.dirname(__dirname))) + '/models')

exports.getConfig = function(callback) {
  console.log('patchMgr::gegetConfigt()')
  try {
    var data = require('../connector.json')
    callback(null, data)
  } catch (e) {
    console.error(e)
    callback(e, null)
  }
}
exports.verifyConfig = function(data, callback) {
  console.log('patchMgr::verifyConfig()')
  if (data && data.module_id && data['trigger-templates'] && Object.keys(data['trigger-templates']).length) {
    console.log('module_id ==> ', data.module_id)
    console.log('==> ', data['trigger-templates'])
    async.eachSeries(
      Object.keys(data['trigger-templates']),
      function(eachGroup, cbGroup) {
        console.log('eachGroup : ', eachGroup)
        if (data['trigger-templates'][eachGroup]) {
          async.eachSeries(
            data['trigger-templates'][eachGroup],
            function(eachTemplate, cbTemplate) {
              console.log('eachTemplate : ', eachTemplate)
              models.LLTDiscovery.findOne(
                {
                  name: eachTemplate.name,
                  connector_module_id: new mongoose.Types.ObjectId(data.module_id)
                },
                function(err, tData) {
                  if (err) {
                    console.error('Error : ', err)
                  }

                  if (!tData) {
                    console.log('-------> insert new tData #TODO :', tData)
                    let templateData = null
                    if (fs.existsSync(LLTDPath + '/' + eachTemplate.template)) {
                      console.log('File exist :', LLTDPath + '/' + eachTemplate.template)
                      templateData = require(LLTDPath + '/' + eachTemplate.template)
                    } else {
                      console.log('File not exist :', LLTDPath + '/' + eachTemplate.template)
                    }
                    var newLLTDiscovery = new models.LLTDiscovery({
                      name: eachTemplate.name,
                      connector_module_id: new mongoose.Types.ObjectId(data.module_id),
                      regex_check: eachTemplate.regular ? eachTemplate.regular : null,
                      get_name: eachTemplate.get_name ? eachTemplate.get_name : null,
                      template: templateData
                    })
                    newLLTDiscovery.save(function(err, rsLLTD) {
                      if (err) {
                        console.error('Error add : ', err)
                      }
                      console.log('rsLLTD : ', rsLLTD)
                      cbTemplate()
                    })
                  } else {
                    console.log('-------> tData :', tData)
                    cbTemplate()
                  }
                }
              )
              //const tData = await models.LLTDiscovery.find({
              //  name : eachTemplate.name,
              //  connector_module_id : new mongoose.Types.ObjectId(data.module_id)
              //})
            },
            function(err) {
              cbGroup()
            }
          )
        } else {
          cbGroup()
        }
      },
      function(err) {
        //If any of the user creation failed may throw error.
        if (err) {
          console.log('unable to create user')
        } else {
          console.log('All user created successfully')
          callback(null, data)
        }
      }
    )
  } else {
    callback(null, data)
  }
}
