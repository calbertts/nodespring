var fs = require('fs')
var path_module = require('path')
var NodeSpringUtil = require('./nodeSpringUtil').default


// The unique module container
var modulesContainer = {}


var ModuleContainer = {

  expressApp: null,

  init: (app, appDir) => {
    //NodeSpringUtil.configureLoggingOut()
    ModuleContainer.expressApp = app
  },

  loadModules: (appDir) => {
    let load = (path) => {
      fs.lstat(path, (err, stat) => {
        if(err)
          throw err
        else if (stat.isDirectory()) {
          fs.readdir(path, (err, files) => {
            let f, l = files.length
            for (let i = 0; i < l; i++) {
              f = path_module.join(path, files[i])
              load(f)
            }
          })
        } else {
          if(path.indexOf('.map') < 0) {
            //let compiledPath = path.replace('src', 'compiled')
            //let moduleName = path_module.basename(compiledPath, '.js')

            //console.log("Loading module => ", moduleName, ', From => ', compiledPath)
            require(path).default
          }
        }
      })
    }

    let baseDir = path_module.join(appDir)
    load(baseDir)
  },

  addController(moduleDef, path) {
    let moduleName = moduleDef.name

    if(!modulesContainer[moduleName]) {
      modulesContainer[moduleName] = {
        methods: [],
        dependents: {}
      }
    }

    modulesContainer[moduleName].path = path
    modulesContainer[moduleName].impl = new moduleDef()

    let moduleInfo = modulesContainer[moduleName]
    let publishedURLs = []

    for(let i=0; i<moduleInfo.methods.length; i++) {
      let methodInfo = moduleInfo.methods[i]

      publishedURLs.push(`/${path}/${methodInfo.methodName}`)

      ModuleContainer.expressApp[methodInfo.httpMethod](`/${path}/${methodInfo.methodName}`, (req, res) => {
        let fn = moduleInfo.impl[methodInfo.methodName]

        let params = NodeSpringUtil.getArgs(fn).map((item, index) => {
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
        let value = fn.apply(moduleInfo.impl, params)

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

    //console.log('Published URLs => ', publishedURLs)
  },

  addRoute: (moduleDef, methodName, httpMethod, contentType) => {
    let moduleName = moduleDef.constructor.name

    if(!modulesContainer[moduleName]) {
      modulesContainer[moduleName] = {
        methods: []
      }
    }

    modulesContainer[moduleName].methods.push({
      methodName: methodName,
      httpMethod: httpMethod,
      contentType: contentType
    })
  },

  validateImpl: (type, impl) => {
    ModuleContainer.addInterface(type.name)

    if(!modulesContainer[type.name].impl) {
      let interfaceMethods = Object.getOwnPropertyNames(type.prototype);
      let implementationMethods = Object.getOwnPropertyNames(impl.prototype);

      interfaceMethods.filter((methodName) => {
        return methodName !== 'constructor'
      }).forEach(methodName => {
        let isMethodImplemented = implementationMethods.indexOf(methodName) >= 0

        if (!isMethodImplemented) {
          console.error(`NodeSpring Error:\nThe method "${methodName}" declared in ${type.name} is not implemented in ${impl.name}\n`)
          return false
        } else {
          let interfaceInstance = new type()
          let interfaceMethodParams = interfaceInstance[methodName]().params

          for (let param in interfaceMethodParams) {
            let implMethodParams = NodeSpringUtil.getArgs(impl.prototype[methodName])
            let isParamPresent = implMethodParams.indexOf(param) >= 0

            if (!isParamPresent) {
              console.error(`NodeSpring Error:\nThe param "${param}" declared in ${type.name}.${methodName}(...) is not present in ${impl.name}.${methodName}(...)\n`)
              return false
            }
          }
        }
      })

      return true
    } else {
      console.error(`NodeSpring Error: \nThere are more than one implementations associated with the Interface: ${type.name}\nThe current implementation is: ${modulesContainer[type.name].name}\nPlease review the class: ${impl.name}, the Interfaces must only have one implementation\n`)
      return false
    }
  },

  addInterface: (type) => {
    if (!ModuleContainer.existsInterface(type)) {
      modulesContainer[type] = {
        impl: null,
        dependents: {},
        dependencies: {},
        structure: {},
        methods: []
      }

      ModuleContainer.injectionResolver(type)
    }
  },

  existsInterface: (type) => {
    return modulesContainer[type]
  },

  injectionResolver: (type) => {
    let resolveDependencies = (dependencies) => {
      for(let property in dependencies) {
        let expectedType = dependencies[property]

        if(ModuleContainer.existsInterface(expectedType) && modulesContainer[expectedType].impl) {      // Dependency resolved previously
          modulesContainer[type].impl[property] = modulesContainer[expectedType].impl

          console.log('Dispatching ', modulesContainer[expectedType].impl.constructor.name, ' for ', modulesContainer[type].impl.constructor.name + '.' + property)
        } else {                                                                        // Dependency pending to be resolved
          if(!ModuleContainer.existsInterface(expectedType)) {
            ModuleContainer.addInterface(expectedType)
          }

          let myOwnDependents = modulesContainer[expectedType].dependents[type] = {}
          myOwnDependents[property] = (impl) => {
            modulesContainer[type].impl[property] = impl

            console.log('Dispatchings ', impl.constructor.name, ' for ', modulesContainer[type].impl.constructor.name + '.' + property)
          }
        }
      }
    }

    let dispatchDependents = (dependents) => {
      for(let className in dependents) {
        let classProperties = dependents[className]

        for(let property in classProperties) {
          let resolverCallback = classProperties[property]
          resolverCallback(modulesContainer[type].impl)
        }
      }
    }

    Object.observe(modulesContainer[type], (changes) => {
      let change = changes.filter((change) => change.type === 'update')[0]

      // Resolve dependencies
      resolveDependencies(modulesContainer[type].dependencies)

      // Dispatch dependents
      dispatchDependents(modulesContainer[type].dependents)
    })
  },

  addDependency: (type, property, typeValue) => {
    ModuleContainer.addInterface(type)
    modulesContainer[type].dependencies[property] = typeValue
  },

  addImplementation: (type, impl) => {
    if(ModuleContainer.validateImpl(type, impl)) {
      modulesContainer[type.name].impl = new impl()
    }
  },

  getModuleContainer: () => {
    return modulesContainer
  }
}


exports.ModuleContainer = ModuleContainer