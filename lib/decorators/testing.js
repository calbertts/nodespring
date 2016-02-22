'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TestClass = TestClass;
exports.Mock = Mock;
exports.Test = Test;
exports.Before = Before;
exports.InjectMocks = InjectMocks;

var _cliColor = require('cli-color');

var _cliColor2 = _interopRequireDefault(_cliColor);

var _exectimer = require('exectimer');

var _exectimer2 = _interopRequireDefault(_exectimer);

var _assert = require('../core/assert');

var _assert2 = _interopRequireDefault(_assert);

var _moduleContainer = require('../core/moduleContainer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
  var className = testClassObj.constructor.name;
  var beforeMethods = testingMethods.filter(function (method) {
    return testClassObj[method].beforeMethod === true;
  });
  var testMethods = testingMethods.filter(function (method) {
    return testClassObj[method].testMethod === true;
  });
  var promises = [];
  var methodStatus = {
    success: [],
    failed: []
  };

  console.log(_cliColor2.default.blue('NodeSpring Unit Test Runner:', _cliColor2.default.yellow(className, '\n')));

  var tick = new _exectimer2.default.Tick(className);
  tick.start();

  testMethods.forEach(function (method) {
    beforeMethods.forEach(function (beforeMethod) {
      testClassObj[beforeMethod]();
    });

    var promise = new Promise(function (resolve, reject) {

      var assertInstance = {};
      Object.assign(assertInstance, _assert2.default);

      assertInstance.done = function () {
        if (assertInstance.ok.lastStack) {

          console.log(_cliColor2.default.red('  ✘', method));
          console.log(_cliColor2.default.red('   ', assertInstance.ok.lastStack), '\n');

          methodStatus.failed.push(method);
          resolve();
          assertInstance.ok.lastStack = null;
        } else {
          console.log(_cliColor2.default.green('  ✔', method), '\n');

          methodStatus.success.push(method);
          resolve();
        }
      };

      testClassObj[method](assertInstance);
    });

    promises.push(promise);
  });

  Promise.all(promises).then(function (values) {
    tick.stop();

    var timeStr = _exectimer2.default.timers[className].parse(_exectimer2.default.timers[className].duration());

    if (methodStatus.failed.length > 0) console.log(' ', _cliColor2.default.red(methodStatus.failed.length, 'of', testMethods.length, 'tests failed'));else console.log(' ', _cliColor2.default.blue('All tests have passed!'));

    console.log(_cliColor2.default.blue('  Time:'), _cliColor2.default.yellow(timeStr), '\n');
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