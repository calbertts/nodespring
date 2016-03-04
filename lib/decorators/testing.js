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

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _assert = require('../core/assert');

var _assert2 = _interopRequireDefault(_assert);

var _moduleContainer = require('../core/moduleContainer');

var _moduleContainer2 = _interopRequireDefault(_moduleContainer);

var _nodeSpringUtil = require('../core/nodeSpringUtil');

var _nodeSpringUtil2 = _interopRequireDefault(_nodeSpringUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Testing decorators
 * @author calbertts
 */

var objectToTest = null;
var mocksToInject = {};

function TestClass(testClass) {
  if (!_nodeSpringUtil2.default.isClass(testClass)) throw new TypeError('A class was expected to test');

  console.log(_cliColor2.default.blue.bold('NodeSpring Unit Test Runner:', _cliColor2.default.yellow(className, '\n')));

  var testClassObj = new testClass();

  // Inject mocks into the object to test
  for (var classProp in objectToTest.dependencies) {
    var dataType = objectToTest.dependencies[classProp];

    if (!mocksToInject[dataType]) {
      console.error(_cliColor2.default.yellow.bold('  WARNING:'), _cliColor2.default.yellow('There isn\'t a mock for the dependency injected in ' + objectToTest.type.name + '.' + classProp + ' (' + _path2.default.basename(dataType) + ')\n           An empty object will be provided, but tests can fail\n'));
      objectToTest.instance[classProp] = {};
    } else {
      objectToTest.instance[classProp] = mocksToInject[dataType].instance;
      mocksToInject[dataType].used = true;
      testClassObj[mocksToInject[dataType].testClassProperty] = mocksToInject[dataType].instance;
    }
  }

  // Check for mocks which aren't required
  for (var dataType in mocksToInject) {
    if (mocksToInject[dataType] && !mocksToInject[dataType].used) {
      console.error(_cliColor2.default.yellow.bold('  WARNING:'), _cliColor2.default.yellow('The declared mock for ' + testClass.name + '.' + mocksToInject[dataType].testClassProperty + ' is not required on ' + objectToTest.instance.constructor.name + '\n'));
    }
  }

  testClassObj[objectToTest.testClassProperty] = objectToTest.instance;

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
        var passedSymbol = process.platform === 'win32' ? 'OK' : '✔';
        var failedSymbol = process.platform === 'win32' ? 'FAIL' : '✘';

        if (assertInstance.ok.lastStack) {

          console.log(_cliColor2.default.red('  ' + _cliColor2.default.red.bold(failedSymbol), method));
          console.log(_cliColor2.default.red('   ', assertInstance.ok.lastStack), '\n');

          methodStatus.failed.push(method);
          resolve();
          assertInstance.ok.lastStack = null;
        } else {
          console.log(_cliColor2.default.green('  ' + _cliColor2.default.green.bold(passedSymbol), method), '\n');

          methodStatus.success.push(method);
          resolve();
        }
      };

      // Execute real method
      testClassObj[method](assertInstance);
    });

    promises.push(promise);
  });

  Promise.all(promises).then(function (values) {
    tick.stop();

    var timeStr = _exectimer2.default.timers[className].parse(_exectimer2.default.timers[className].duration());

    if (methodStatus.failed.length > 0) console.log(' ', _cliColor2.default.red(methodStatus.failed.length, 'of', testMethods.length, 'tests failed'));else console.log(' ', _cliColor2.default.blue('All tests have passed!'));

    console.log(_cliColor2.default.blue.bold('  Time:'), _cliColor2.default.yellow(timeStr), '\n');
  });
}

function Mock(type) {
  if (type.moduleType !== 'interface' && type.moduleType !== 'service') throw new TypeError('Mock expects an Interface or a Service as a parameter, instead ' + (type.name ? type.name : 'unknown') + ' was received');

  return function (target, property, descriptor) {
    var mockInstance = {
      uniqueMethod: function uniqueMethod() {
        return "String from mock";
      }
    };

    descriptor.writable = true;

    mocksToInject[type.packagePath] = {
      testClassProperty: property,
      used: false,
      instance: mockInstance
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
    var instance = undefined;

    switch (type.moduleType) {

      case 'implementation':
        metaInstance = _moduleContainer2.default.getModuleContainer()[type.interfacePackagePath];
        instance = metaInstance.impl;
        break;

      case 'service':
        metaInstance = _moduleContainer2.default.getModuleContainer()[type.packagePath];
        instance = metaInstance.impl;
        break;

      case 'controller':
        metaInstance = _moduleContainer2.default.getModuleContainer()[type.packagePath];
        instance = metaInstance.impl;
        break;
    }

    objectToTest = {
      type: type,
      testClassProperty: property,
      instance: instance,
      dependencies: metaInstance.dependencies
    };
  };
}
//# sourceMappingURL=testing.js.map