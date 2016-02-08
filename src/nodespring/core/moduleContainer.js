var fs = require('fs')
var path_module = require('path')

var app
var moduleContainer = {}

/**
 * Method to get the arguments' names
 *
 * @param func
 * @returns {Array.<String>}
 */
var getArgs = function(func) {

  // First match everything inside the function argument parens.
  var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1]

  // Split the arguments string into an array comma delimited.
  return args.split(',').map(function(arg) {

    // Ensure no inline comments are parsed and trim the whitespace.
    return arg.replace(/\/\*.*\*\//, '').trim()
  }).filter(function(arg) {

    // Ensure no undefined values are added.
    return arg
  })
}

exports.ModuleContainer = {

  init: (_app) => {
    app = _app
  },

  loadControllers: () => {
    let load = (path) => {
      fs.lstat(path, (err, stat) => {
        if (stat.isDirectory()) {
          fs.readdir(path, (err, files) => {
            let f, l = files.length
            for (let i = 0; i < l; i++) {
              f = path_module.join(path, files[i])
              load(f)
            }
          })
        } else {
          if(path.indexOf('.map') < 0) {
            let compiledPath = path.replace('src', 'compiled')
            let moduleName = path_module.basename(compiledPath, '.js')

            console.log("Loading module => ", moduleName, ', From => ', compiledPath)
            let module = require(compiledPath).default
          }
        }
      })
    }

    let baseDir = path_module.join(__dirname, '../../app')
    console.log(baseDir)
    load(baseDir)
  },

  getModuleContainer: () => {
    return moduleContainer
  },

  addModule(moduleDef, path) {
    let moduleName = moduleDef.name

    if(!moduleContainer[moduleName]) {
      moduleContainer[moduleName] = {
        methods: []
      }
    }

    moduleContainer[moduleName].path = path
    moduleContainer[moduleName].moduleInstance = new moduleDef()

    let moduleInfo = moduleContainer[moduleName]
    let publishedURLs = []

    for(let i=0; i<moduleInfo.methods.length; i++) {
      let methodInfo = moduleInfo.methods[i]

      publishedURLs.push(`/${path}/${methodInfo.methodName}`)

      app[methodInfo.httpMethod](`/${path}/${methodInfo.methodName}`, (req, res) => {
        let fn = moduleInfo.moduleInstance[methodInfo.methodName]

        var params = getArgs(fn).map((item, index) => {
          let clientData = req.body || req.query
          return clientData[item] || (clientData[item + '[]'] instanceof Array ? clientData[item + '[]'] : [clientData[item + '[]']])
        })

        let handleResponse = (response) => {
          res.contentType(methodInfo.contentType)

          if(methodInfo.contentType === 'application/json') {
            res.json(response)
          } else {
            res.send(response)
          }
        }

        // Getting method response
        let value = fn.apply(moduleInfo.moduleInstance, params)

        if(value instanceof Promise) {
          value
            .then((data) => {
              handleResponse(data)
            })
            .catch((err) => {
              console.error(err)
              handleResponse([])
            })
        } else {
          handleResponse(value)
        }
      })
    }

    console.log('Published URLs => ', publishedURLs)
  },

  addRoute: (moduleDef, methodName, httpMethod, contentType) => {
    let moduleName = moduleDef.constructor.name

    if(!moduleContainer[moduleName]) {
      moduleContainer[moduleName] = {
        methods: []
      }
    }

    moduleContainer[moduleName].methods.push({
      methodName: methodName,
      httpMethod: httpMethod,
      contentType: contentType
    })
  }
}