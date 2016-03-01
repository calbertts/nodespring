/**
 * ModuleContainer
 * @author calbertts
 *
 * This class handles all the stuff relates with:
 *
 *    Controllers and HTTP methods
 *    Dependency Injection
 */

import fs from 'fs'
import path_module from 'path'
import NodeSpringUtil from './nodeSpringUtil'
import NodeSpringException from '../exceptions/NodeSpringException'

// The unique module container
global.modulesContainer = {}
var modulesContainer = global.modulesContainer


export default class ModuleContainer {

  NodeSpringApp = null

  static init(app, appDir) {
    //NodeSpringUtil.configureLoggingOut()
    ModuleContainer.NodeSpringApp = app
  }

  static loadModules(appDir) {
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
            //console.log("Loading file => " + path)
            require(path).default
          }
        }
      })
    }

    let baseDir = path_module.join(appDir)
    load(baseDir)
  }

  static addService(moduleDef) {
    let moduleName = moduleDef.name

    ModuleContainer.addInterface(moduleName)
    modulesContainer[moduleName].impl = new moduleDef()
    modulesContainer[moduleName].moduleType = moduleDef.moduleType

    ModuleContainer.runInjectionResolver(moduleName)
  }

  static addController(moduleDef, path) {
    let moduleName = moduleDef.name

    ModuleContainer.addInterface(moduleName)
    modulesContainer[moduleName].path = path
    modulesContainer[moduleName].impl = new moduleDef()
    modulesContainer[moduleName].moduleType = moduleDef.moduleType

    ModuleContainer.runInjectionResolver(moduleName)

    let moduleInfo = modulesContainer[moduleName]
    let publishedURLs = []

    for(let i=0; i<moduleInfo.methods.length; i++) {
      let methodInfo = moduleInfo.methods[i]

      publishedURLs.push(`/${path}/${methodInfo.methodName}`)

      ModuleContainer.NodeSpringApp.bindURL(methodInfo.httpMethod, `/${path}/${methodInfo.methodName}`, (req, res) => {
        let fn = moduleInfo.impl[methodInfo.methodName]

        ModuleContainer.NodeSpringApp.getRequestParams(req, (params) => {
          let fullParams = NodeSpringUtil.getArgs(fn).map((item, index) => {
            return params[item] || (params[item + '[]'] instanceof Array ? params[item + '[]'] : [params[item + '[]']])
          })

          let handleResponse = (data) => {
            ModuleContainer.NodeSpringApp.setContentTypeResponse(res, methodInfo.contentType)

            if(methodInfo.contentType === 'application/json') {
              ModuleContainer.NodeSpringApp.sendJSONResponse(res, data)
            } else {
              ModuleContainer.NodeSpringApp.sendDataResponse(res, data)
            }
          }

          // Getting method response
          let value = fn.apply(moduleInfo.impl, fullParams)

          if(value instanceof Promise) {
            value
              .then((data) => {
                handleResponse(data)
              })
              .catch((err) => {
                handleResponse([])
              })
          } else {
            handleResponse(value)
          }
        })
      })
    }
  }

  static addRoute(moduleDef, methodName, httpMethod, contentType) {
    let moduleName = moduleDef.constructor.name

    ModuleContainer.addInterface(moduleName)

    modulesContainer[moduleName].methods.push({
      methodName: methodName,
      httpMethod: httpMethod,
      contentType: contentType
    })
  }

  static validateImpl(type, impl) {
    ModuleContainer.addInterface(type.name)

    //if(!modulesContainer[type.name].impl) {
      let interfaceMethods = Object.getOwnPropertyNames(type.prototype)
      let implementationMethods = Object.getOwnPropertyNames(impl.prototype)

      interfaceMethods.filter((methodName) => {
        return methodName !== 'constructor'
      }).forEach(methodName => {
        let isMethodImplemented = implementationMethods.indexOf(methodName) >= 0

        if (!isMethodImplemented) {
          let errorMessage = `The method "${methodName}" declared in ${type.name} is not implemented in ${impl.name}`
          let methodNotImplemented = new NodeSpringException(errorMessage, ModuleContainer.addImplementation, 1)

          NodeSpringUtil.throwNodeSpringException(methodNotImplemented)
        } else {
          NodeSpringUtil.getArgs(type.prototype[methodName]).forEach((param) => {
            let implMethodParams = NodeSpringUtil.getArgs(impl.prototype[methodName])
            let isParamPresent = implMethodParams.indexOf(param) >= 0

            if (!isParamPresent) {
              let errorMessage = `The param "${param}" declared in ${type.name}.${methodName}(...) is not present in ${impl.name}.${methodName}(...)`
              let missingParam = new NodeSpringException(errorMessage, ModuleContainer.addImplementation, 1)

              NodeSpringUtil.throwNodeSpringException(missingParam)
            }
          })
        }
      })

      return true
    /*} else {
      console.error(`NodeSpring Error: \nThere are more than one implementations associated with the Interface: ${type.name}\nThe current implementation is: ${modulesContainer[type.name].name}\nPlease review the class: ${impl.name}, the Interfaces must only have one implementation\n`)
      return false
    }*/
  }

  static addInterface(type) {
    if (!ModuleContainer.existsInterface(type)) {
      modulesContainer[type] = {
        impl: null,
        dependents: {},
        dependencies: {},
        structure: {},
        methods: [],
        instanceResolvedValue: false,
        isInstanceResolved: () => {
          if(modulesContainer[type].moduleType === 'service' || modulesContainer[type].moduleType === 'controller') {
            return modulesContainer[type].impl !== null
          } else {
            return modulesContainer[type].instanceResolvedValue
          }
        },
        getInstance: () => {
          if(modulesContainer[type].moduleType === 'service' || modulesContainer[type].moduleType === 'controller') {
            return new Promise((resolve, reject) => {
              resolve(modulesContainer[type].impl)
            })
          } else {
            let moduleInfo = modulesContainer[type]
            let dependencies = moduleInfo.dependencies

            if (Object.keys(dependencies).length > 0) {
              let dependenciesInstancesPromises = []
              let mapImplVariable = {}

              for(let property in dependencies) {
                let moduleNeeded = dependencies[property]

                let promise = modulesContainer[moduleNeeded].getInstance()

                mapImplVariable[moduleNeeded] = property

                dependenciesInstancesPromises.push(promise)
              }

              return new Promise((resolve, reject) => {

                /**
                 * Wait for the dependencies are resolved to be injected
                 * in the instance that's being created
                 */
                Promise.all(dependenciesInstancesPromises).then((instances) => {
                  //console.error('Promise scope', type, modulesContainer[type].scope)
                  let mainInstance = modulesContainer[type].impl.scope === 'prototype' ? new modulesContainer[type].impl() : modulesContainer[type].impl

                  instances.forEach((instanceToInject) => {
                    let varType = instanceToInject.constructor.interfaceName
                    let property = mapImplVariable[varType]

                    mainInstance[property] = instanceToInject
                  })

                  // Call the init method once all the dependencies are created and injected
                  let postInjectMethod = modulesContainer[type].postInjectMethod

                  if(postInjectMethod) {
                    mainInstance[postInjectMethod]()
                  }

                  // Resolve the complete instance to the modules which are waiting for it
                  resolve(mainInstance)
                }).catch((err) => {
                  console.error('Error resolving instance for', type, err)
                })
              })
            } else {

              /**
               * If the module doesn't have dependencies, will wait for the implementation
               * is loaded to dispatch the instance.
               */
              return new Promise((resolve, reject) => {
                Object.observe(modulesContainer[type], (changes) => {
                  let change = changes.filter((change) => change.type === 'update')[0]

                  modulesContainer[type].instanceResolvedValue = true
                  resolve(!modulesContainer[type].impl.scope ? modulesContainer[type].impl : new modulesContainer[type].impl())
                })
              })
            }
          }
        },
        injectDependency: (property, impl) => {
          modulesContainer[type].impl[property] = impl
        }
      }
    }
  }

  static existsInterface(type) {
    return modulesContainer[type] !== undefined
  }

  static resolveDependencies(type, dependencies) {
    for(let property in dependencies) {
      let expectedType = dependencies[property]

      if(ModuleContainer.existsInterface(expectedType) && modulesContainer[expectedType].isInstanceResolved()) {
        modulesContainer[expectedType].getInstance().then((instance) => {
          modulesContainer[type].injectDependency(property, instance)

          let targetInstanceName = modulesContainer[type].impl.scope ? modulesContainer[type].impl.name : modulesContainer[type].impl.constructor.name
          console.log('Dispatching an instance of ', modulesContainer[expectedType].impl.constructor.name, ' for ', targetInstanceName + '.' + property)
        })
      } else {
        if(!ModuleContainer.existsInterface(expectedType)) {
          ModuleContainer.addInterface(expectedType)
        }

        let myOwnDependents = modulesContainer[expectedType].dependents[type] = {}

        myOwnDependents[property] = {
          dispatched: false,
          callback: (instance) => {
            modulesContainer[type].injectDependency(property, instance)

            let targetInstanceName = modulesContainer[type].impl.scope ? modulesContainer[type].impl.name : modulesContainer[type].impl.constructor.name
            console.log('Dispatching an instance of ', instance.constructor.name, ' for ', targetInstanceName + '.' + property)
          }
        }
      }
    }
  }

  static dispatchDependents(type, dependents) {
    for(let className in dependents) {
      let classProperties = dependents[className]

      for(let property in classProperties) {
        let resolverCallbackInfo = classProperties[property]

        modulesContainer[type].getInstance().then((instance) => {
          if(!resolverCallbackInfo.dispatched) {
            resolverCallbackInfo.callback(instance)
            resolverCallbackInfo.dispatched = true
          }
        }).catch((err) => {
          console.error('Error dispatching instance for the property', property)
        })
      }
    }
  }

  static runInjectionResolver(type) {
    // Resolve dependencies
    ModuleContainer.resolveDependencies(type, modulesContainer[type].dependencies)

    // Dispatch dependents registered dependents
    ModuleContainer.dispatchDependents(type, modulesContainer[type].dependents)

    // Wait for future dependents to be resolved
    Object.observe(modulesContainer[type].dependents, (changes) => {
      ModuleContainer.dispatchDependents(type, modulesContainer[type].dependents)
    })
  }

  static addDependency(type, property, typeToInject) {
    ModuleContainer.addInterface(type)
    modulesContainer[type].dependencies[property] = typeToInject.name
  }

  static addImplementation(type, impl) {
    if(ModuleContainer.validateImpl(type, impl)) {
      modulesContainer[type.name].impl = (impl.scope === 'prototype') ? impl : new impl()
      ModuleContainer.runInjectionResolver(type.name)
    }
  }

  static addPostInjectMethod(type, methodName) {
    modulesContainer[type].postInjectMethod = methodName
  }

  static getModuleContainer() {
    return modulesContainer
  }
}
