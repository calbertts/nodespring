'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TestClass = TestClass;
exports.Mock = Mock;
exports.Test = Test;
exports.Before = Before;
exports.InjectMocks = InjectMocks;

var _moduleContainer = require('../core/moduleContainer');

var injectMocksCllbk;
var localMocksInjectedCllbk;
var mocksToInject = {};

var isClass = function isClass(arg) {
  return arg && arg.constructor === Function;
};

function TestClass(testClass) {
  if (!isClass(testClass)) throw new TypeError('A class was expected to test');

  var testClassObj = new testClass();

  injectMocksCllbk(testClassObj);
  localMocksInjectedCllbk(testClassObj);

  var testingMethods = Object.getOwnPropertyNames(testClass.prototype);

  // Running all methods
  var beforeMethods = testingMethods.filter(function (method) {
    return testClassObj[method].beforeMethod === true;
  });
  var testMethods = testingMethods.filter(function (method) {
    return testClassObj[method].testMethod === true;
  });

  testMethods.forEach(function (method) {
    beforeMethods.forEach(function (beforeMethod) {
      testClassObj[beforeMethod]();
    });
    testClassObj[method]();
  });
}

function Mock(type) {
  if (!type.moduleType === 'interface') throw new TypeError('Mock expects an Interface as a parameter, instead ' + type.name + ' was received');

  return function (target, property, descriptor) {
    var mockInstance = {
      uniqueMethod: function uniqueMethod() {
        return "String from mock";
      }
    };

    descriptor.writable = true;
    mocksToInject[type.name] = mockInstance;

    localMocksInjectedCllbk = function localMocksInjectedCllbk(testClassObj) {
      testClassObj[property] = mockInstance;
    };
  };
}

function Test(target, property, descriptor) {
  if (typeof target[property] !== 'function') throw new TypeError('A function was expected to test: ' + property);

  descriptor.value.testMethod = true;
}

function Before(target, property, descriptor) {
  if (typeof target[property] !== 'function') throw new TypeError('A function was expected to test: ' + property);

  descriptor.value.beforeMethod = true;
}

function InjectMocks(type) {
  return function (target, property, descriptor) {
    descriptor.writable = true;

    var metaInstance = undefined;
    var objToTest = undefined;

    switch (type.moduleType) {

      case 'implementation':
        metaInstance = _moduleContainer.ModuleContainer.getModuleContainer()[type.interfaceName];
        objToTest = new metaInstance.impl();
        break;

      case 'service':
        metaInstance = _moduleContainer.ModuleContainer.getModuleContainer()[type.name];
        objToTest = metaInstance.impl;
        break;

      case 'controller':
        throw new TypeError('Testing for Controllers are not supported yet');
        break;
    }

    for (var classProp in metaInstance.dependencies) {
      var dataType = metaInstance.dependencies[classProp];
      objToTest[classProp] = mocksToInject[dataType];
    }

    injectMocksCllbk = function injectMocksCllbk(testClassObj) {
      testClassObj[property] = objToTest;
    };
  };
}
//# sourceMappingURL=testing.js.map