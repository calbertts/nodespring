'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var fs = require('fs');
var path_module = require('path');
var NodeSpringUtil = require('./nodeSpringUtil').default;

// The unique module container
global.modulesContainer = {};
var modulesContainer = global.modulesContainer;

var ModuleContainer = {

  expressApp: null,

  init: function init(app, appDir) {
    //NodeSpringUtil.configureLoggingOut()
    ModuleContainer.expressApp = app;
  },

  loadModules: function loadModules(appDir) {
    var load = function load(path) {
      fs.lstat(path, function (err, stat) {
        if (err) throw err;else if (stat.isDirectory()) {
          fs.readdir(path, function (err, files) {
            var f = undefined,
                l = files.length;
            for (var i = 0; i < l; i++) {
              f = path_module.join(path, files[i]);
              load(f);
            }
          });
        } else {
          if (path.indexOf('.map') < 0) {
            //let compiledPath = path.replace('src', 'compiled')
            //let moduleName = path_module.basename(compiledPath, '.js')

            //console.log("Loading module => ", moduleName, ', From => ', compiledPath)
            require(path).default;
          }
        }
      });
    };

    var baseDir = path_module.join(appDir);
    load(baseDir);
  },

  addService: function addService(moduleDef) {
    var moduleName = moduleDef.name;

    ModuleContainer.addInterface(moduleName);
    modulesContainer[moduleName].impl = new moduleDef();
    modulesContainer[moduleName].moduleType = moduleDef.moduleType;

    ModuleContainer.runInjectionResolver(moduleName);
  },
  addController: function addController(moduleDef, path) {
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

      ModuleContainer.expressApp[methodInfo.httpMethod]('/' + path + '/' + methodInfo.methodName, function (req, res) {
        var fn = moduleInfo.impl[methodInfo.methodName];

        var params = NodeSpringUtil.getArgs(fn).map(function (item, index) {
          var clientData = req.body || req.query;
          return clientData[item] || (clientData[item + '[]'] instanceof Array ? clientData[item + '[]'] : [clientData[item + '[]']]);
        });

        var handleResponse = function handleResponse(response) {
          res.contentType(methodInfo.contentType);

          if (methodInfo.contentType === 'application/json') {
            res.json(response);
          } else {
            res.send(response);
          }
        };

        // Getting method response
        var value = fn.apply(moduleInfo.impl, params);

        if (value instanceof Promise) {
          value.then(function (data) {
            handleResponse(data);
          }).catch(function (err) {
            console.error(err);
            handleResponse([]);
          });
        } else {
          handleResponse(value);
        }
      });
    };

    for (var i = 0; i < moduleInfo.methods.length; i++) {
      _loop(i);
    }

    //console.log('Published URLs => ', publishedURLs)
  },


  addRoute: function addRoute(moduleDef, methodName, httpMethod, contentType) {
    var moduleName = moduleDef.constructor.name;

    // TODO: "this" object is wrong here
    if (!modulesContainer[moduleName]) {
      modulesContainer[moduleName] = {
        methods: []
      };
    }

    modulesContainer[moduleName].methods.push({
      methodName: methodName,
      httpMethod: httpMethod,
      contentType: contentType
    });
  },

  validateImpl: function validateImpl(type, impl) {
    ModuleContainer.addInterface(type.name);

    if (!modulesContainer[type.name].impl) {
      var _ret2 = function () {
        var interfaceMethods = Object.getOwnPropertyNames(type.prototype);
        var implementationMethods = Object.getOwnPropertyNames(impl.prototype);

        interfaceMethods.filter(function (methodName) {
          return methodName !== 'constructor';
        }).forEach(function (methodName) {
          var isMethodImplemented = implementationMethods.indexOf(methodName) >= 0;

          if (!isMethodImplemented) {
            console.error('NodeSpring Error:\nThe method "' + methodName + '" declared in ' + type.name + ' is not implemented in ' + impl.name + '\n');
            return false;
          } else {
            var interfaceInstance = new type();
            var interfaceMethodParams = interfaceInstance[methodName]().params;

            for (var param in interfaceMethodParams) {
              var implMethodParams = NodeSpringUtil.getArgs(impl.prototype[methodName]);
              var isParamPresent = implMethodParams.indexOf(param) >= 0;

              if (!isParamPresent) {
                console.error('NodeSpring Error:\nThe param "' + param + '" declared in ' + type.name + '.' + methodName + '(...) is not present in ' + impl.name + '.' + methodName + '(...)\n');
                return false;
              }
            }
          }
        });

        return {
          v: true
        };
      }();

      if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
    } else {
      console.error('NodeSpring Error: \nThere are more than one implementations associated with the Interface: ' + type.name + '\nThe current implementation is: ' + modulesContainer[type.name].name + '\nPlease review the class: ' + impl.name + ', the Interfaces must only have one implementation\n');
      return false;
    }
  },

  addInterface: function addInterface(type) {
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
              var _ret3 = function () {
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
                      var mainInstance = new modulesContainer[type].impl();

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
                    });
                  })
                };
              }();

              if ((typeof _ret3 === 'undefined' ? 'undefined' : _typeof(_ret3)) === "object") return _ret3.v;
            } else {
              return new Promise(function (resolve, reject) {
                Object.observe(modulesContainer[type], function (changes) {
                  var change = changes.filter(function (change) {
                    return change.type === 'update';
                  })[0];
                  modulesContainer[type].instanceResolvedValue = true;
                  resolve(new modulesContainer[type].impl());
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
  },

  existsInterface: function existsInterface(type) {
    return modulesContainer[type];
  },

  resolveDependencies: function resolveDependencies(type, dependencies) {
    var _loop2 = function _loop2(property) {
      var expectedType = dependencies[property];

      if (ModuleContainer.existsInterface(expectedType) && modulesContainer[expectedType].isInstanceResolved()) {
        modulesContainer[expectedType].getInstance().then(function (instance) {
          modulesContainer[type].injectDependency(property, instance);

          console.log('Dispatching ', modulesContainer[expectedType].impl.constructor.name, ' for ', modulesContainer[type].impl.constructor.name + '.' + property);
        });
      } else {
        if (!ModuleContainer.existsInterface(expectedType)) {
          ModuleContainer.addInterface(expectedType);
        }

        var myOwnDependents = modulesContainer[expectedType].dependents[type] = {};
        myOwnDependents[property] = function (instance) {
          modulesContainer[type].injectDependency(property, instance);

          console.log('Dispatchings ', instance.constructor.name, ' for ', modulesContainer[type].impl.constructor.name + '.' + property);
        };
      }
    };

    for (var property in dependencies) {
      _loop2(property);
    }
  },

  dispatchDependents: function dispatchDependents(type, dependents) {
    for (var className in dependents) {
      var classProperties = dependents[className];

      var _loop3 = function _loop3(property) {
        var resolverCallback = classProperties[property];
        modulesContainer[type].getInstance().then(function (instance) {
          resolverCallback(instance);
        });
      };

      for (var property in classProperties) {
        _loop3(property);
      }
    }
  },

  runInjectionResolver: function runInjectionResolver(type) {
    // Resolve dependencies
    ModuleContainer.resolveDependencies(type, modulesContainer[type].dependencies);

    // Dispatch dependents
    ModuleContainer.dispatchDependents(type, modulesContainer[type].dependents);
  },

  addDependency: function addDependency(type, property, typeToInject) {
    if (typeToInject.moduleType === 'controller') throw new TypeError('You cannot inject a Controller as a dependency, please take a look on ' + type.name);

    ModuleContainer.addInterface(type);
    modulesContainer[type].dependencies[property] = typeToInject.name;
  },

  addImplementation: function addImplementation(type, impl) {
    if (ModuleContainer.validateImpl(type, impl)) {
      modulesContainer[type.name].impl = impl;

      ModuleContainer.runInjectionResolver(type.name);

      /*if(ModuleContainer.validateImpl(type, impl)) {
       modulesContainer[type.name].impl = new impl()
       ModuleContainer.runInjectionResolver(type.name)
       }*/
    }
  },

  addPostInjectMethod: function addPostInjectMethod(type, methodName) {
    modulesContainer[type].postInjectMethod = methodName;
  },

  getModuleContainer: function getModuleContainer() {
    return modulesContainer;
  }
};

exports.ModuleContainer = ModuleContainer;
//# sourceMappingURL=moduleContainer.js.map