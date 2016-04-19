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

global.modulesContainer = {}
let modulesContainer = global.modulesContainer

export default class ModuleContainer {

  static appDir = null
  static implConfig = {}
  static nodeSpringApp = {
    bindURL: () => {},
    addSocketListener: () => {},
    addSocketListeners: () => {}
  }

  static init(appDir, nodeSpringApp, implConfig, logging = false, loggingSync = false, debugging = false) {
    NodeSpringUtil.logging = logging
    NodeSpringUtil.configureLoggingOut(loggingSync)
    NodeSpringUtil.debugging = debugging

    ModuleContainer.appDir = appDir
    ModuleContainer.implConfig = implConfig
    ModuleContainer.nodeSpringApp = nodeSpringApp || ModuleContainer.nodeSpringApp
  }

  static loadModules() {
    let load = (path) => {
      try {
        let stat = fs.lstatSync(path)

        if (stat.isDirectory()) {
          let files = fs.readdirSync(path)
          let f, l = files.length
          for (let i = 0; i<l; i++) {
            f = path_module.join(path, files[i])
            load(f)
          }
        } else {
          if(path.indexOf('.map') < 0) {
            require(path)
            NodeSpringUtil.log("Loading file => " + path)
          }
        }
      } catch(e) {
        throw new NodeSpringException(e.message, this)
      }
    }

    let baseDir = path_module.join(ModuleContainer.appDir)
    load(baseDir)

    // All metadata is loaded except the injected instances
    ModuleContainer.nodeSpringApp.configureSocketListeners()
  }

  static addService(moduleDef) {
    let moduleName = moduleDef.packagePath

    ModuleContainer.addInterface(moduleName)
    modulesContainer[moduleName].impl = new moduleDef()
    modulesContainer[moduleName].impl.packagePath = moduleDef.packagePath
    modulesContainer[moduleName].moduleType = moduleDef.moduleType

    ModuleContainer.resolveDependencies(moduleName)
  }

  static addController(moduleDef, path, namespace) {
    let moduleName = moduleDef.packagePath

    ModuleContainer.addInterface(moduleName)
    modulesContainer[moduleName].path = path
    modulesContainer[moduleName].impl = new moduleDef()
    modulesContainer[moduleName].impl.packagePath = moduleDef.packagePath
    modulesContainer[moduleName].moduleType = moduleDef.moduleType

    ModuleContainer.resolveDependencies(moduleName)

    let moduleInfo = modulesContainer[moduleName]

    let processRequest = (req, res, methodInfo) => {
      let fn = moduleInfo.impl[methodInfo.methodName]

      ModuleContainer.nodeSpringApp.getRequestParams(req, (params) => {
        let fullParams = NodeSpringUtil.getArgs(fn).map((item, index) => {
          return params[item] || (params[item + '[]'] instanceof Array ? params[item + '[]'] : [params[item + '[]']])
        })

        let handleResponse = (data) => {
          ModuleContainer.nodeSpringApp.setContentTypeResponse(res, methodInfo.contentType)

          if(methodInfo.contentType === 'application/json') {
            ModuleContainer.nodeSpringApp.sendJSONResponse(res, data)
          } else {
            ModuleContainer.nodeSpringApp.sendDataResponse(res, data)
          }
        }

        // Getting method response
        fn.request = req
        fn.response = res
        let value = fn.apply(moduleInfo.impl, fullParams)

        // Clear
        delete fn.request
        delete fn.response

        if(value !== undefined) {
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
        }
      })
    }

    /**
     * This metadata is created in addSocketListener method
     */
    ModuleContainer.nodeSpringApp.addSocketListeners(namespace, moduleInfo.socketListeners, moduleInfo.impl)

    // Bind index method
    ModuleContainer.nodeSpringApp.bindURL('get', `/${path}`, (req, res) => {
      processRequest(req, res, {methodName: 'index'})
    })

    // Bind the other endpoints
    moduleInfo.methods.forEach((methodInfo) => {
      ModuleContainer.nodeSpringApp.bindURL(methodInfo.httpMethod, `/${path}/${methodInfo.methodName}`, (req, res) => {
        processRequest(req, res, methodInfo)
      })
    })
  }

  static addRoute(moduleDef, methodName, httpMethod, contentType) {
    let moduleName = moduleDef.packagePath

    ModuleContainer.addInterface(moduleName)

    modulesContainer[moduleName].methods.push({
      methodName: methodName,
      httpMethod: httpMethod,
      contentType: contentType
    })
  }

  static addSocketListener(moduleDef, methodName, options) {
    let moduleName = moduleDef.packagePath

    ModuleContainer.addInterface(moduleName)

    modulesContainer[moduleName].socketListeners.push({
      methodName: methodName,
      eventName: options.eventName ? options.eventName : methodName
    })
  }

  static validateImpl(type, impl) {
    ModuleContainer.addInterface(type.packagePath)

    let interfaceMethods = Object.getOwnPropertyNames(type.prototype)
    let implementationMethods = Object.getOwnPropertyNames(impl.prototype)

    interfaceMethods.filter((methodName) => {
      return methodName !== 'constructor'
    }).forEach(methodName => {
      let isMethodImplemented = implementationMethods.indexOf(methodName) >= 0

      if (!isMethodImplemented) {
        let errorMessage = `The method "${methodName}" declared in ${type.packagePath} is not implemented in ${impl.name}`
        let methodNotImplemented = new NodeSpringException(errorMessage, ModuleContainer.addImplementation, 1)

        NodeSpringUtil.throwNodeSpringException(methodNotImplemented)
      } else {
        NodeSpringUtil.getArgs(type.prototype[methodName]).forEach((param) => {
          let implMethodParams = NodeSpringUtil.getArgs(impl.prototype[methodName])
          let isParamPresent = implMethodParams.indexOf(param) >= 0

          if (!isParamPresent) {
            let errorMessage = `The param "${param}" declared in ${type.packagePath}.${methodName}(...) is not present in ${impl.name}.${methodName}(...)`
            let missingParam = new NodeSpringException(errorMessage, ModuleContainer.addImplementation, 1)

            NodeSpringUtil.throwNodeSpringException(missingParam)
          }
        })
      }
    })

    return true
  }

  static addInterface(type) {
    if (modulesContainer[type] === undefined) {
      modulesContainer[type] = {
        impl: null,
        dependencies: {},
        methods: [],
        socketListeners: [],
        postInjectMethodExecuted: false,
        getInstance: () => {
          return ModuleContainer.resolveDependencies(type)
        }
      }
    }
  }

  static resolveDependencies(type) {
    let moduleInfo = modulesContainer[type]
    let dependencies = moduleInfo.dependencies

    if (modulesContainer[type].impl && Object.keys(dependencies).length > 0) {
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

          let mainInstance = modulesContainer[type].impl.scope === 'prototype' ? new modulesContainer[type].impl() : modulesContainer[type].impl

          instances.forEach((instanceToInject) => {
            let varType = instanceToInject.constructor.interfacePackagePath || instanceToInject.packagePath
            let property = mapImplVariable[varType]

            mainInstance[property] = instanceToInject
          })

          // Call the init method once all the dependencies are created and injected
          let postInjectMethod = modulesContainer[type].postInjectMethod

          if(postInjectMethod && !modulesContainer[type].postInjectMethodExecuted) {
            mainInstance[postInjectMethod]()
            modulesContainer[type].postInjectMethodExecuted = true
          }

          // Resolve the complete instance to the modules which are waiting for it
          resolve(mainInstance)
        }).catch((err) => {
          NodeSpringUtil.error('Error resolving instance for', type, err)
          reject(err)
        })
      })
    } else {

      /**
       * If the module doesn't have dependencies, returns the impl if it's loaded or
       * will wait for the implementation that is loaded to dispatch the instance.
       */

      return new Promise((resolve, reject) => {
        if(modulesContainer[type].impl) {
          if(modulesContainer[type].impl.scope) {
            if(modulesContainer[type].impl.scope === 'singleton') {
              resolve(modulesContainer[type].impl)
            }
            else if(modulesContainer[type].impl.scope === 'prototype')
              resolve(new modulesContainer[type].impl())
          } else {
            resolve(modulesContainer[type].impl)
          }
        } else {
          Object.observe(modulesContainer[type], (changes) => {
            let change = changes.filter((change) => change.type === 'update')[0]

            if(Object.keys(modulesContainer[type].dependencies).length > 0) {
              modulesContainer[type].getInstance().then((instance) => {
                resolve(instance)
              })
            } else {
              resolve(!modulesContainer[type].impl.scope ? modulesContainer[type].impl : new modulesContainer[type].impl())
            }
          })
        }
      })
    }
  }

  static addDependency(type, property, typeToInject) {
    ModuleContainer.addInterface(type)
    modulesContainer[type].dependencies[property] = typeToInject.packagePath
  }

  static addImplementation(type, impl) {
    if(ModuleContainer.validateImpl(type, impl)) {
      modulesContainer[type.packagePath].impl = (impl.scope === 'prototype') ? impl : new impl()
      ModuleContainer.resolveDependencies(type.packagePath)
    }
  }

  static addPostInjectMethod(type, methodName) {
    ModuleContainer.addInterface(type)
    modulesContainer[type].postInjectMethod = methodName
  }

  static getModuleContainer() {
    return modulesContainer
  }
}
