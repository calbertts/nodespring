var fs = require('fs')
var path_module = require('path')

var app
var moduleContainer = {}

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
    moduleContainer[moduleName].moduleDef = new moduleDef()

    let moduleInfo = moduleContainer[moduleName]

    for(let i=0; i<moduleInfo.methods.length; i++) {
      let methodInfo = moduleInfo.methods[i]

      console.log('Binding URL => ', `/${path}/${methodInfo.methodName}`)

      app[methodInfo.httpMethod](`/${path}/${methodInfo.methodName}`, (req, res) => {
        let value = moduleInfo.moduleDef[methodInfo.methodName]()

        res.contentType(methodInfo.contentType)
        res.send(value)
      })
    }
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