'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TestClass = TestClass;
exports.Mock = Mock;
exports.Test = Test;
exports.InjectMocks = InjectMocks;

var _moduleContainer = require('../core/moduleContainer');

var injectMocksCllbk;
var localMocksInjectedCllbk;
var mocksToInject = {};

function TestClass(testClass) {
  var testClassObj = new testClass();
  injectMocksCllbk(testClassObj);
  localMocksInjectedCllbk(testClassObj);

  console.log(testClassObj);

  console.log(testClassObj.test1());
}

function Mock(type) {
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

function Test() {
  return function (target) {
    console.log('Inside ', target.name);
  };
}

function InjectMocks(type) {
  return function (target, property, descriptor) {
    descriptor.writable = true;

    var metaInstance = _moduleContainer.ModuleContainer.getModuleContainer()[type.interfaceName];
    var objToTest = metaInstance.impl;

    for (var classProp in metaInstance.dependencies) {
      var dataType = metaInstance.dependencies[classProp];
      objToTest[classProp] = mocksToInject[dataType];
    }

    injectMocksCllbk = function injectMocksCllbk(testClassObj) {
      testClassObj[property] = objToTest;
      console.log('objToTest', objToTest);
    };
  };
}
//# sourceMappingURL=testing.js.map