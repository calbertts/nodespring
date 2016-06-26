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

var _NodeSpringUtil = require('./NodeSpringUtil');

var _NodeSpringUtil2 = _interopRequireDefault(_NodeSpringUtil);

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

      _NodeSpringUtil2.default.logging = logging;
      _NodeSpringUtil2.default.configureLoggingOut(loggingSync);
      _NodeSpringUtil2.default.debugging = debugging;

      ModuleContainer.appDir = appDir;
      ModuleContainer.implConfig = implConfig;
      ModuleContainer.nodeSpringApp = nodeSpringApp || ModuleContainer.nodeSpringApp;
    }
  }, {
    key: 'loadModules',
    value: function loadModules() {
      var _this = this;

      var load = function load(path) {
        try {
          var stat = _fs2.default.lstatSync(path);

          if (stat.isDirectory()) {
            var files = _fs2.default.readdirSync(path);
            var f = void 0,
                l = files.length;
            for (var i = 0; i < l; i++) {
              f = _path2.default.join(path, files[i]);
              load(f);
            }
          } else {
            if (_path2.default.extname(path) === '.js') {
              require(path);
            }
          }
        } catch (e) {
          throw new _NodeSpringException2.default(e.message, _this);
        }
      };

      var baseDir = _path2.default.join(ModuleContainer.appDir);
      load(baseDir);

      // All metadata is loaded except the injected instances
      ModuleContainer.nodeSpringApp.configureSocketListeners();
    }
  }, {
    key: 'addService',
    value: function addService(moduleDef) {
      var moduleName = moduleDef.packagePath;

      ModuleContainer.addInterface(moduleName);
      modulesContainer[moduleName].impl = new moduleDef();
      modulesContainer[moduleName].impl.packagePath = moduleDef.packagePath;
      modulesContainer[moduleName].moduleType = moduleDef.moduleType;

      ModuleContainer.resolveDependencies(moduleName);
    }
  }, {
    key: 'addController',
    value: function addController(moduleDef, path, namespace) {
      var moduleName = moduleDef.packagePath;

      ModuleContainer.addInterface(moduleName);
      modulesContainer[moduleName].path = path;
      modulesContainer[moduleName].impl = new moduleDef();
      modulesContainer[moduleName].impl.packagePath = moduleDef.packagePath;
      modulesContainer[moduleName].moduleType = moduleDef.moduleType;

      ModuleContainer.resolveDependencies(moduleName);

      var moduleInfo = modulesContainer[moduleName];

      var processRequest = function processRequest(req, res, methodInfo) {
        var fn = moduleInfo.impl[methodInfo.methodName];

        ModuleContainer.nodeSpringApp.getRequestParams(req, function (params) {
          var fullParams = _NodeSpringUtil2.default.getArgs(fn).map(function (item, index) {
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
          fn.request = req;
          fn.response = res;
          var value = fn.apply(moduleInfo.impl, fullParams);

          // Clear
          delete fn.request;
          delete fn.response;

          if (value !== undefined) {
            if (value instanceof Promise) {
              value.then(function (data) {
                handleResponse(data);
              }).catch(function (err) {
                handleResponse([]);
              });
            } else {
              handleResponse(value);
            }
          }
        });
      };

      /**
       * This metadata is created in addSocketListener method
       */
      ModuleContainer.nodeSpringApp.addSocketListeners(namespace, moduleInfo.socketListeners, moduleInfo.impl);

      // Bind index method
      ModuleContainer.nodeSpringApp.bindURL('get', '/' + path, function (req, res) {
        processRequest(req, res, { methodName: 'index' });
      });

      // Bind the other endpoints
      moduleInfo.methods.forEach(function (methodInfo) {
        ModuleContainer.nodeSpringApp.bindURL(methodInfo.httpMethod, '/' + path + '/' + methodInfo.methodName, function (req, res) {
          processRequest(req, res, methodInfo);
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
    value: function addSocketListener(moduleDef, methodName, options) {
      var moduleName = moduleDef.packagePath;

      ModuleContainer.addInterface(moduleName);

      modulesContainer[moduleName].socketListeners.push({
        methodName: methodName,
        eventName: options.eventName ? options.eventName : methodName
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

          _NodeSpringUtil2.default.throwNodeSpringException(methodNotImplemented);
        } else {
          _NodeSpringUtil2.default.getArgs(type.prototype[methodName]).forEach(function (param) {
            var implMethodParams = _NodeSpringUtil2.default.getArgs(impl.prototype[methodName]);
            var isParamPresent = implMethodParams.indexOf(param) >= 0;

            if (!isParamPresent) {
              var errorMessage = 'The param "' + param + '" declared in ' + type.packagePath + '.' + methodName + '(...) is not present in ' + impl.name + '.' + methodName + '(...)';
              var missingParam = new _NodeSpringException2.default(errorMessage, ModuleContainer.addImplementation, 1);

              _NodeSpringUtil2.default.throwNodeSpringException(missingParam);
            }
          });
        }
      });

      return true;
    }
  }, {
    key: 'addInterface',
    value: function addInterface(type) {
      if (modulesContainer[type] === undefined) {
        modulesContainer[type] = {
          impl: null,
          dependencies: {},
          methods: [],
          socketListeners: [],
          postInjectMethodExecuted: false,
          getInstance: function getInstance() {
            return ModuleContainer.resolveDependencies(type);
          }
        };
      }
    }
  }, {
    key: 'resolveDependencies',
    value: function resolveDependencies(type) {
      var moduleInfo = modulesContainer[type];
      var dependencies = moduleInfo.dependencies;

      if (modulesContainer[type].impl && Object.keys(dependencies).length > 0) {
        var _ret = function () {
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

                var mainInstance = modulesContainer[type].impl.scope === 'prototype' ? new modulesContainer[type].impl() : modulesContainer[type].impl;

                instances.forEach(function (instanceToInject) {
                  var varType = instanceToInject.constructor.interfacePackagePath || instanceToInject.packagePath;
                  var property = mapImplVariable[varType];

                  mainInstance[property] = instanceToInject;
                });

                // Call the init method once all the dependencies are created and injected
                var postInjectMethod = modulesContainer[type].postInjectMethod;

                if (postInjectMethod && !modulesContainer[type].postInjectMethodExecuted) {
                  modulesContainer[type].postInjectMethodExecuted = true;
                  mainInstance[postInjectMethod]();

                  delete modulesContainer[type].postInjectMethod;
                }

                // Resolve the complete instance to the modules which are waiting for it
                resolve(mainInstance);
              }).catch(function (err) {
                _NodeSpringUtil2.default.error('Error resolving instance for', type, err);
                reject(err);
              });
            })
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      } else {

        /**
         * If the module doesn't have dependencies, returns the impl if it's loaded or
         * will wait for the implementation that is loaded to dispatch the instance.
         */

        return new Promise(function (resolve, reject) {
          if (modulesContainer[type].impl) {
            if (modulesContainer[type].impl.scope) {
              if (modulesContainer[type].impl.scope === 'singleton') {
                resolve(modulesContainer[type].impl);
              } else if (modulesContainer[type].impl.scope === 'prototype') resolve(new modulesContainer[type].impl());
            } else {
              resolve(modulesContainer[type].impl);
            }
          } else {
            Object.observe(modulesContainer[type], function (changes) {
              var change = changes.filter(function (change) {
                return change.type === 'update';
              })[0];

              if (Object.keys(modulesContainer[type].dependencies).length > 0) {
                modulesContainer[type].getInstance().then(function (instance) {
                  resolve(instance);
                });
              } else {
                resolve(!modulesContainer[type].impl.scope ? modulesContainer[type].impl : new modulesContainer[type].impl());
              }
            });
          }
        });
      }
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
        ModuleContainer.resolveDependencies(type.packagePath);
      }
    }
  }, {
    key: 'addPostInjectMethod',
    value: function addPostInjectMethod(type, methodName) {
      ModuleContainer.addInterface(type);
      modulesContainer[type].postInjectMethod = methodName;
    }
  }, {
    key: 'getModuleContainer',
    value: function getModuleContainer() {
      return modulesContainer;
    }
  }]);

  return ModuleContainer;
}(), _class.appDir = null, _class.implConfig = {}, _class.nodeSpringApp = {
  bindURL: function bindURL() {},
  addSocketListener: function addSocketListener() {},
  addSocketListeners: function addSocketListeners() {}
}, _temp);
exports.default = ModuleContainer;
//# sourceMappingURL=ModuleContainer.js.map