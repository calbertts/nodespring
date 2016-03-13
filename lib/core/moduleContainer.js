'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp; /**
                    * ModuleContainer
                    * @author calbertts
                    *
                    * This class handles all the stuff relates with:
                    *
                    *    Controllers and HTTP methods
                    *    Dependency Injection
                    */

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _nodeSpringUtil = require('./nodeSpringUtil');

var _nodeSpringUtil2 = _interopRequireDefault(_nodeSpringUtil);

var _NodeSpringException = require('../exceptions/NodeSpringException');

var _NodeSpringException2 = _interopRequireDefault(_NodeSpringException);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

global.modulesContainer = {};
var modulesContainer = global.modulesContainer;

var ModuleContainer = (_temp = _class = function () {
  function ModuleContainer() {
    _classCallCheck(this, ModuleContainer);
  }

  _createClass(ModuleContainer, null, [{
    key: 'init',
    value: function init(appDir, nodeSpringApp, implConfig) {
      var logging = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
      var loggingSync = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];
      var debugging = arguments.length <= 5 || arguments[5] === undefined ? false : arguments[5];

      _nodeSpringUtil2.default.logging = logging;
      _nodeSpringUtil2.default.configureLoggingOut(loggingSync);
      _nodeSpringUtil2.default.debugging = debugging;

      ModuleContainer.appDir = appDir;
      ModuleContainer.implConfig = implConfig;
      ModuleContainer.nodeSpringApp = nodeSpringApp;
    }
  }, {
    key: 'loadModules',
    value: function loadModules() {
      var load = function load(path) {
        _fs2.default.lstat(path, function (err, stat) {
          if (err) throw err;else if (stat.isDirectory()) {
            _fs2.default.readdir(path, function (err, files) {
              var f = undefined,
                  l = files.length;
              for (var i = 0; i < l; i++) {
                f = _path2.default.join(path, files[i]);
                load(f);
              }
            });
          } else {
            if (path.indexOf('.map') < 0) {
              _nodeSpringUtil2.default.debug("Loading file => " + path);
              require(path);
            }
          }
        });
      };

      var baseDir = _path2.default.join(ModuleContainer.appDir);
      load(baseDir);
    }
  }, {
    key: 'addService',
    value: function addService(moduleDef) {
      var moduleName = moduleDef.packagePath;

      ModuleContainer.addInterface(moduleName);
      modulesContainer[moduleName].impl = new moduleDef();
      modulesContainer[moduleName].moduleType = moduleDef.moduleType;

      ModuleContainer.runInjectionResolver(moduleName);
    }
  }, {
    key: 'addController',
    value: function addController(moduleDef, path) {
      var moduleName = moduleDef.packagePath;

      ModuleContainer.addInterface(moduleName);
      modulesContainer[moduleName].path = path;
      modulesContainer[moduleName].impl = new moduleDef();
      modulesContainer[moduleName].moduleType = moduleDef.moduleType;

      ModuleContainer.runInjectionResolver(moduleName);

      var moduleInfo = modulesContainer[moduleName];

      moduleInfo.socketListeners.forEach(function (socketListener) {
        var handler = moduleInfo.impl[socketListener.methodName];

        ModuleContainer.nodeSpringApp.addSocketListener(socketListener.eventName, handler, moduleInfo.impl);
      });

      moduleInfo.methods.forEach(function (methodInfo) {
        ModuleContainer.nodeSpringApp.bindURL(methodInfo.httpMethod, '/' + path + '/' + methodInfo.methodName, function (req, res) {
          var fn = moduleInfo.impl[methodInfo.methodName];

          ModuleContainer.nodeSpringApp.getRequestParams(req, function (params) {
            var fullParams = _nodeSpringUtil2.default.getArgs(fn).map(function (item, index) {
              return params[item] || (params[item + '[]'] instanceof Array ? params[item + '[]'] : [params[item + '[]']]);
            });

            var handleResponse = function handleResponse(data) {
              ModuleContainer.nodeSpringApp.setContentTypeResponse(res, methodInfo.contentType);

              if (methodInfo.contentType === 'application/json') {
                ModuleContainer.nodeSpringApp.sendJSONResponse(res, data);
              } else {
                ModuleContainer.nodeSpringApp.sendDataResponse(res, data);
              }
            };

            // Getting method response
            var value = fn.apply(moduleInfo.impl, fullParams);

            if (value instanceof Promise) {
              value.then(function (data) {
                handleResponse(data);
              }).catch(function (err) {
                handleResponse([]);
              });
            } else {
              handleResponse(value);
            }
          });
        });
      });
    }
  }, {
    key: 'addRoute',
    value: function addRoute(moduleDef, methodName, httpMethod, contentType) {
      var moduleName = moduleDef.packagePath;

      ModuleContainer.addInterface(moduleName);

      modulesContainer[moduleName].methods.push({
        methodName: methodName,
        httpMethod: httpMethod,
        contentType: contentType
      });
    }
  }, {
    key: 'addSocketListener',
    value: function addSocketListener(moduleDef, methodName, eventName) {
      var moduleName = moduleDef.packagePath;

      ModuleContainer.addInterface(moduleName);

      modulesContainer[moduleName].socketListeners.push({
        methodName: methodName,
        eventName: eventName ? eventName : methodName
      });
    }
  }, {
    key: 'validateImpl',
    value: function validateImpl(type, impl) {
      ModuleContainer.addInterface(type.packagePath);

      var interfaceMethods = Object.getOwnPropertyNames(type.prototype);
      var implementationMethods = Object.getOwnPropertyNames(impl.prototype);

      interfaceMethods.filter(function (methodName) {
        return methodName !== 'constructor';
      }).forEach(function (methodName) {
        var isMethodImplemented = implementationMethods.indexOf(methodName) >= 0;

        if (!isMethodImplemented) {
          var errorMessage = 'The method "' + methodName + '" declared in ' + type.packagePath + ' is not implemented in ' + impl.name;
          var methodNotImplemented = new _NodeSpringException2.default(errorMessage, ModuleContainer.addImplementation, 1);

          _nodeSpringUtil2.default.throwNodeSpringException(methodNotImplemented);
        } else {
          _nodeSpringUtil2.default.getArgs(type.prototype[methodName]).forEach(function (param) {
            var implMethodParams = _nodeSpringUtil2.default.getArgs(impl.prototype[methodName]);
            var isParamPresent = implMethodParams.indexOf(param) >= 0;

            if (!isParamPresent) {
              var errorMessage = 'The param "' + param + '" declared in ' + type.packagePath + '.' + methodName + '(...) is not present in ' + impl.name + '.' + methodName + '(...)';
              var missingParam = new _NodeSpringException2.default(errorMessage, ModuleContainer.addImplementation, 1);

              _nodeSpringUtil2.default.throwNodeSpringException(missingParam);
            }
          });
        }
      });

      return true;
    }
  }, {
    key: 'addInterface',
    value: function addInterface(type) {
      if (!ModuleContainer.existsInterface(type)) {
        modulesContainer[type] = {
          impl: null,
          dependents: {},
          dependencies: {},
          methods: [],
          socketListeners: [],
          instanceResolvedValue: false,
          isInstanceResolved: function isInstanceResolved() {
            if (modulesContainer[type].moduleType === 'service' || modulesContainer[type].moduleType === 'controller') {
              return modulesContainer[type].impl !== null;
            } else {
              return modulesContainer[type].instanceResolvedValue;
            }
          },
          getInstance: function getInstance() {
            if (modulesContainer[type].moduleType === 'service' || modulesContainer[type].moduleType === 'controller') {
              return new Promise(function (resolve, reject) {
                resolve(modulesContainer[type].impl);
              });
            } else {
              var moduleInfo = modulesContainer[type];
              var dependencies = moduleInfo.dependencies;

              _nodeSpringUtil2.default.debug('getInstance for an Impl', type, dependencies);

              if (Object.keys(dependencies).length > 0) {
                var _ret = function () {
                  _nodeSpringUtil2.default.debug('has dependencies');

                  var dependenciesInstancesPromises = [];
                  var mapImplVariable = {};

                  for (var property in dependencies) {
                    var moduleNeeded = dependencies[property];

                    var promise = modulesContainer[moduleNeeded].getInstance();

                    mapImplVariable[moduleNeeded] = property;

                    dependenciesInstancesPromises.push(promise);
                  }

                  return {
                    v: new Promise(function (resolve, reject) {

                      /**
                       * Wait for the dependencies are resolved to be injected
                       * in the instance that's being created
                       */
                      Promise.all(dependenciesInstancesPromises).then(function (instances) {
                        _nodeSpringUtil2.default.debug('another listener');
                      });

                      Promise.all(dependenciesInstancesPromises).then(function (instances) {
                        _nodeSpringUtil2.default.debug('official promises resolved');

                        //NodeSpringUtil.error('Promise scope', type, modulesContainer[type].scope)
                        var mainInstance = modulesContainer[type].impl.scope === 'prototype' ? new modulesContainer[type].impl() : modulesContainer[type].impl;

                        instances.forEach(function (instanceToInject) {
                          var varType = instanceToInject.constructor.interfacePackagePath;
                          var property = mapImplVariable[varType];

                          mainInstance[property] = instanceToInject;
                        });

                        // Call the init method once all the dependencies are created and injected
                        var postInjectMethod = modulesContainer[type].postInjectMethod;

                        if (postInjectMethod) {
                          mainInstance[postInjectMethod]();
                        }

                        // Resolve the complete instance to the modules which are waiting for it
                        resolve(mainInstance);
                      }).catch(function (err) {
                        _nodeSpringUtil2.default.error('Error resolving instance for', type, err);
                      });
                    })
                  };
                }();

                if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
              } else {

                //NodeSpringUtil.debug('return instance without dependencies', type)

                /**
                 * If the module doesn't have dependencies, returns the impl if it's loaded or
                 * will wait for the implementation that is loaded to dispatch the instance.
                 */
                return new Promise(function (resolve, reject) {
                  if (modulesContainer[type].impl) {
                    _nodeSpringUtil2.default.debug('No dependencies, instance resolved');
                    modulesContainer[type].instanceResolvedValue = true;
                    resolve(!modulesContainer[type].impl.scope ? modulesContainer[type].impl : new modulesContainer[type].impl());
                  } else {
                    _nodeSpringUtil2.default.debug('No dependencies, observing for impl to be resolved');

                    Object.observe(modulesContainer[type], function (changes) {
                      _nodeSpringUtil2.default.debug('impl arrived', type);

                      var change = changes.filter(function (change) {
                        return change.type === 'update';
                      })[0];

                      modulesContainer[type].instanceResolvedValue = true;
                      resolve(!modulesContainer[type].impl.scope ? modulesContainer[type].impl : new modulesContainer[type].impl());
                    });
                  }
                });
              }
            }
          },
          injectDependency: function injectDependency(property, impl) {
            modulesContainer[type].impl[property] = impl;
          }
        };
      }
    }
  }, {
    key: 'existsInterface',
    value: function existsInterface(type) {
      return modulesContainer[type] !== undefined;
    }
  }, {
    key: 'resolveDependencies',
    value: function resolveDependencies(type, dependencies) {
      var _loop = function _loop(property) {
        var expectedType = dependencies[property];

        _nodeSpringUtil2.default.debug('expectedType', expectedType);

        if (ModuleContainer.existsInterface(expectedType) && modulesContainer[expectedType].isInstanceResolved()) {
          //NodeSpringUtil.debug('exist!')

          modulesContainer[expectedType].getInstance().then(function (instance) {
            //NodeSpringUtil.debug('promise resolved:', instance)
            modulesContainer[type].injectDependency(property, instance);

            var targetInstanceName = modulesContainer[type].impl.scope ? modulesContainer[type].impl.name : modulesContainer[type].impl.constructor.name;
            _nodeSpringUtil2.default.log('Dispatching an instance of ', modulesContainer[expectedType].impl.constructor.name, ' for ', targetInstanceName + '.' + property);
          });
        } else {
          _nodeSpringUtil2.default.debug('doesnt exist!');
          if (!ModuleContainer.existsInterface(expectedType)) {
            _nodeSpringUtil2.default.debug('creating!');
            ModuleContainer.addInterface(expectedType);
          }

          //NodeSpringUtil.debug('modulesContainer[expectedType]', modulesContainer[expectedType])

          var myOwnDependents = modulesContainer[expectedType].dependents[type] = {};

          myOwnDependents[property] = {
            dispatched: false,
            callback: function callback(instance) {
              _nodeSpringUtil2.default.debug("I'm here!", instance);
              modulesContainer[type].injectDependency(property, instance);

              var targetInstanceName = modulesContainer[type].impl.scope ? modulesContainer[type].impl.name : modulesContainer[type].impl.constructor.name;
              _nodeSpringUtil2.default.log('Dispatching an instance of ', instance.constructor.name, ' for ', targetInstanceName + '.' + property);
            }
          };
        }
      };

      for (var property in dependencies) {
        _loop(property);
      }
    }
  }, {
    key: 'dispatchDependents',
    value: function dispatchDependents(type, dependents) {
      for (var className in dependents) {
        var classProperties = dependents[className];

        var _loop2 = function _loop2(property) {
          var resolverCallbackInfo = classProperties[property];

          modulesContainer[type].getInstance().then(function (instance) {
            if (!resolverCallbackInfo.dispatched) {
              resolverCallbackInfo.callback(instance);
              resolverCallbackInfo.dispatched = true;
            }
          }).catch(function (err) {
            _nodeSpringUtil2.default.error('Error dispatching instance for the property', property);
          });
        };

        for (var property in classProperties) {
          _loop2(property);
        }
      }
    }
  }, {
    key: 'runInjectionResolver',
    value: function runInjectionResolver(type) {

      //NodeSpringUtil.debug('type, modulesContainer[type].dependencies', type, modulesContainer[type].dependencies)

      // Resolve dependencies
      ModuleContainer.resolveDependencies(type, modulesContainer[type].dependencies);

      // Dispatch dependents registered dependents
      ModuleContainer.dispatchDependents(type, modulesContainer[type].dependents);

      // Wait for future dependents to be resolved
      Object.observe(modulesContainer[type].dependents, function (changes) {
        ModuleContainer.dispatchDependents(type, modulesContainer[type].dependents);
      });
    }
  }, {
    key: 'addDependency',
    value: function addDependency(type, property, typeToInject) {
      ModuleContainer.addInterface(type);
      modulesContainer[type].dependencies[property] = typeToInject.packagePath;
    }
  }, {
    key: 'addImplementation',
    value: function addImplementation(type, impl) {
      if (ModuleContainer.validateImpl(type, impl)) {
        modulesContainer[type.packagePath].impl = impl.scope === 'prototype' ? impl : new impl();
        ModuleContainer.runInjectionResolver(type.packagePath);
      }
    }
  }, {
    key: 'addPostInjectMethod',
    value: function addPostInjectMethod(type, methodName) {
      modulesContainer[type].postInjectMethod = methodName;
    }
  }, {
    key: 'getModuleContainer',
    value: function getModuleContainer() {
      return modulesContainer;
    }
  }, {
    key: 'clearModuleContainer',
    value: function clearModuleContainer() {
      modulesContainer = {};
    }
  }]);

  return ModuleContainer;
}(), _class.appDir = null, _class.implConfig = {}, _class.nodeSpringApp = {
  bindURL: function bindURL() {},
  addSocketListener: function addSocketListener() {}
}, _temp);
exports.default = ModuleContainer;
//# sourceMappingURL=ModuleContainer.js.map