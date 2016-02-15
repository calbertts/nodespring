'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var fs = require('fs');
var path_module = require('path');
var NodeSpringUtil = require('./nodeSpringUtil').default;

// The unique module container
var modulesContainer = {};

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

  addController: function addController(moduleDef, path) {
    var moduleName = moduleDef.name;

    if (!modulesContainer[moduleName]) {
      modulesContainer[moduleName] = {
        methods: [],
        dependents: {}
      };
    }

    modulesContainer[moduleName].path = path;
    modulesContainer[moduleName].impl = new moduleDef();

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
        methods: []
      };

      ModuleContainer.injectionResolver(type);
    }
  },

  existsInterface: function existsInterface(type) {
    return modulesContainer[type];
  },

  injectionResolver: function injectionResolver(type) {
    var resolveDependencies = function resolveDependencies(dependencies) {
      var _loop2 = function _loop2(property) {
        var expectedType = dependencies[property];

        if (ModuleContainer.existsInterface(expectedType) && modulesContainer[expectedType].impl) {
          // Dependency resolved previously
          modulesContainer[type].impl[property] = modulesContainer[expectedType].impl;

          console.log('Dispatching ', modulesContainer[expectedType].impl.constructor.name, ' for ', modulesContainer[type].impl.constructor.name + '.' + property);
        } else {
          // Dependency pending to be resolved
          if (!ModuleContainer.existsInterface(expectedType)) {
            ModuleContainer.addInterface(expectedType);
          }

          var myOwnDependents = modulesContainer[expectedType].dependents[type] = {};
          myOwnDependents[property] = function (impl) {
            modulesContainer[type].impl[property] = impl;

            console.log('Dispatchings ', impl.constructor.name, ' for ', modulesContainer[type].impl.constructor.name + '.' + property);
          };
        }
      };

      for (var property in dependencies) {
        _loop2(property);
      }
    };

    var dispatchDependents = function dispatchDependents(dependents) {
      for (var className in dependents) {
        var classProperties = dependents[className];

        for (var property in classProperties) {
          var resolverCallback = classProperties[property];
          resolverCallback(modulesContainer[type].impl);
        }
      }
    };

    Object.observe(modulesContainer[type], function (changes) {
      var change = changes.filter(function (change) {
        return change.type === 'update';
      })[0];

      // Resolve dependencies
      resolveDependencies(modulesContainer[type].dependencies);

      // Dispatch dependents
      dispatchDependents(modulesContainer[type].dependents);
    });
  },

  addDependency: function addDependency(type, property, typeValue) {
    ModuleContainer.addInterface(type);
    modulesContainer[type].dependencies[property] = typeValue;
  },

  addImplementation: function addImplementation(type, impl) {
    if (ModuleContainer.validateImpl(type, impl)) {
      modulesContainer[type.name].impl = new impl();
    }
  }
};

exports.ModuleContainer = ModuleContainer;
//# sourceMappingURL=moduleContainer.js.map