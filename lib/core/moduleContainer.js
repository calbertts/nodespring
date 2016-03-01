'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
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

// The unique module container
global.modulesContainer = {};
var modulesContainer = global.modulesContainer;

var ModuleContainer = function () {
  function ModuleContainer() {
    _classCallCheck(this, ModuleContainer);

    this.NodeSpringApp = null;
  }

  _createClass(ModuleContainer, null, [{
    key: 'init',
    value: function init(app, appDir) {
      //NodeSpringUtil.configureLoggingOut()
      ModuleContainer.NodeSpringApp = app;
    }
  }, {
    key: 'loadModules',
    value: function loadModules(appDir) {
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
              //console.log("Loading file => " + path)
              require(path).default;
            }
          }
        });
      };

      var baseDir = _path2.default.join(appDir);
      load(baseDir);
    }
  }, {
    key: 'addService',
    value: function addService(moduleDef) {
      var moduleName = moduleDef.name;

      ModuleContainer.addInterface(moduleName);
      modulesContainer[moduleName].impl = new moduleDef();
      modulesContainer[moduleName].moduleType = moduleDef.moduleType;

      ModuleContainer.runInjectionResolver(moduleName);
    }
  }, {
    key: 'addController',
    value: function addController(moduleDef, path) {
      var moduleName = moduleDef.name;

      ModuleContainer.addInterface(moduleName);
      modulesContainer[moduleName].path = path;
      modulesContainer[moduleName].impl = new moduleDef();
      modulesContainer[moduleName].moduleType = moduleDef.moduleType;

      ModuleContainer.runInjectionResolver(moduleName);

      var moduleInfo = modulesContainer[moduleName];
      var publishedURLs = [];

      var _loop = function _loop(i) {
        var methodInfo = moduleInfo.methods[i];

        publishedURLs.push('/' + path + '/' + methodInfo.methodName);

        ModuleContainer.NodeSpringApp.bindURL(methodInfo.httpMethod, '/' + path + '/' + methodInfo.methodName, function (req, res) {
          var fn = moduleInfo.impl[methodInfo.methodName];

          ModuleContainer.NodeSpringApp.getRequestParams(req, function (params) {
            var fullParams = _nodeSpringUtil2.default.getArgs(fn).map(function (item, index) {
              return params[item] || (params[item + '[]'] instanceof Array ? params[item + '[]'] : [params[item + '[]']]);
            });

            var handleResponse = function handleResponse(data) {
              ModuleContainer.NodeSpringApp.setContentTypeResponse(res, methodInfo.contentType);

              if (methodInfo.contentType === 'application/json') {
                ModuleContainer.NodeSpringApp.sendJSONResponse(res, data);
              } else {
                ModuleContainer.NodeSpringApp.sendDataResponse(res, data);
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
      };

      for (var i = 0; i < moduleInfo.methods.length; i++) {
        _loop(i);
      }
    }
  }, {
    key: 'addRoute',
    value: function addRoute(moduleDef, methodName, httpMethod, contentType) {
      var moduleName = moduleDef.constructor.name;

      ModuleContainer.addInterface(moduleName);

      modulesContainer[moduleName].methods.push({
        methodName: methodName,
        httpMethod: httpMethod,
        contentType: contentType
      });
    }
  }, {
    key: 'validateImpl',
    value: function validateImpl(type, impl) {
      ModuleContainer.addInterface(type.name);

      //if(!modulesContainer[type.name].impl) {
      var interfaceMethods = Object.getOwnPropertyNames(type.prototype);
      var implementationMethods = Object.getOwnPropertyNames(impl.prototype);

      interfaceMethods.filter(function (methodName) {
        return methodName !== 'constructor';
      }).forEach(function (methodName) {
        var isMethodImplemented = implementationMethods.indexOf(methodName) >= 0;

        if (!isMethodImplemented) {
          var errorMessage = 'The method "' + methodName + '" declared in ' + type.name + ' is not implemented in ' + impl.name;
          var methodNotImplemented = new _NodeSpringException2.default(errorMessage, ModuleContainer.addImplementation, 1);

          _nodeSpringUtil2.default.throwNodeSpringException(methodNotImplemented);
        } else {
          _nodeSpringUtil2.default.getArgs(type.prototype[methodName]).forEach(function (param) {
            var implMethodParams = _nodeSpringUtil2.default.getArgs(impl.prototype[methodName]);
            var isParamPresent = implMethodParams.indexOf(param) >= 0;

            if (!isParamPresent) {
              var errorMessage = 'The param "' + param + '" declared in ' + type.name + '.' + methodName + '(...) is not present in ' + impl.name + '.' + methodName + '(...)';
              var missingParam = new _NodeSpringException2.default(errorMessage, ModuleContainer.addImplementation, 1);

              _nodeSpringUtil2.default.throwNodeSpringException(missingParam);
            }
          });
        }
      });

      return true;
      /*} else {
        console.error(`NodeSpring Error: \nThere are more than one implementations associated with the Interface: ${type.name}\nThe current implementation is: ${modulesContainer[type.name].name}\nPlease review the class: ${impl.name}, the Interfaces must only have one implementation\n`)
        return false
      }*/
    }
  }, {
    key: 'addInterface',
    value: function addInterface(type) {
      if (!ModuleContainer.existsInterface(type)) {
        modulesContainer[type] = {
          impl: null,
          dependents: {},
          dependencies: {},
          structure: {},
          methods: [],
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

              if (Object.keys(dependencies).length > 0) {
                var _ret2 = function () {
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
                        //console.error('Promise scope', type, modulesContainer[type].scope)
                        var mainInstance = modulesContainer[type].impl.scope === 'prototype' ? new modulesContainer[type].impl() : modulesContainer[type].impl;

                        instances.forEach(function (instanceToInject) {
                          var varType = instanceToInject.constructor.interfaceName;
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
                        console.error('Error resolving instance for', type, err);
                      });
                    })
                  };
                }();

                if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
              } else {

                /**
                 * If the module doesn't have dependencies, will wait for the implementation
                 * is loaded to dispatch the instance.
                 */
                return new Promise(function (resolve, reject) {
                  Object.observe(modulesContainer[type], function (changes) {
                    var change = changes.filter(function (change) {
                      return change.type === 'update';
                    })[0];

                    modulesContainer[type].instanceResolvedValue = true;
                    resolve(!modulesContainer[type].impl.scope ? modulesContainer[type].impl : new modulesContainer[type].impl());
                  });
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
      var _loop2 = function _loop2(property) {
        var expectedType = dependencies[property];

        if (ModuleContainer.existsInterface(expectedType) && modulesContainer[expectedType].isInstanceResolved()) {
          modulesContainer[expectedType].getInstance().then(function (instance) {
            modulesContainer[type].injectDependency(property, instance);

            var targetInstanceName = modulesContainer[type].impl.scope ? modulesContainer[type].impl.name : modulesContainer[type].impl.constructor.name;
            console.log('Dispatching an instance of ', modulesContainer[expectedType].impl.constructor.name, ' for ', targetInstanceName + '.' + property);
          });
        } else {
          if (!ModuleContainer.existsInterface(expectedType)) {
            ModuleContainer.addInterface(expectedType);
          }

          var myOwnDependents = modulesContainer[expectedType].dependents[type] = {};

          myOwnDependents[property] = {
            dispatched: false,
            callback: function callback(instance) {
              modulesContainer[type].injectDependency(property, instance);

              var targetInstanceName = modulesContainer[type].impl.scope ? modulesContainer[type].impl.name : modulesContainer[type].impl.constructor.name;
              console.log('Dispatching an instance of ', instance.constructor.name, ' for ', targetInstanceName + '.' + property);
            }
          };
        }
      };

      for (var property in dependencies) {
        _loop2(property);
      }
    }
  }, {
    key: 'dispatchDependents',
    value: function dispatchDependents(type, dependents) {
      for (var className in dependents) {
        var classProperties = dependents[className];

        var _loop3 = function _loop3(property) {
          var resolverCallbackInfo = classProperties[property];

          modulesContainer[type].getInstance().then(function (instance) {
            if (!resolverCallbackInfo.dispatched) {
              resolverCallbackInfo.callback(instance);
              resolverCallbackInfo.dispatched = true;
            }
          }).catch(function (err) {
            console.error('Error dispatching instance for the property', property);
          });
        };

        for (var property in classProperties) {
          _loop3(property);
        }
      }
    }
  }, {
    key: 'runInjectionResolver',
    value: function runInjectionResolver(type) {
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
      modulesContainer[type].dependencies[property] = typeToInject.name;
    }
  }, {
    key: 'addImplementation',
    value: function addImplementation(type, impl) {
      if (ModuleContainer.validateImpl(type, impl)) {
        modulesContainer[type.name].impl = impl.scope === 'prototype' ? impl : new impl();
        ModuleContainer.runInjectionResolver(type.name);
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
  }]);

  return ModuleContainer;
}();

exports.default = ModuleContainer;
//# sourceMappingURL=ModuleContainer.js.map