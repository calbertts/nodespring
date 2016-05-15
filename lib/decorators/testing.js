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

var _ModuleContainer = require('../core/ModuleContainer');

var _ModuleContainer2 = _interopRequireDefault(_ModuleContainer);

var _NodeSpringUtil = require('../core/NodeSpringUtil');

var _NodeSpringUtil2 = _interopRequireDefault(_NodeSpringUtil);

var _NodeSpringException = require('../exceptions/NodeSpringException');

var _NodeSpringException2 = _interopRequireDefault(_NodeSpringException);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var objectToTest = null; /**
                          * Testing decorators
                          * @author calbertts
                          */

var mocksToInject = {};

function TestClass(testClass) {
  if (!testClass || !_NodeSpringUtil2.default.isClass(testClass)) {
    throw new _NodeSpringException2.default('@TestClass expects a Class but an ' + testClass + ' was received.', this, 2);
  }

  _NodeSpringUtil2.default.logging = true;
  _NodeSpringUtil2.default.log(_cliColor2.default.blue.bold('NodeSpring Unit Test Runner:', _cliColor2.default.yellow(className, '\n')));

  var testClassObj = new testClass();

  // Inject mocks into the object to test
  for (var classProp in objectToTest.dependencies) {
    var dataType = objectToTest.dependencies[classProp];

    if (!mocksToInject[dataType]) {
      _NodeSpringUtil2.default.error(_cliColor2.default.yellow.bold('  WARNING:'), _cliColor2.default.yellow('There isn\'t a mock for the dependency injected in ' + objectToTest.type.name + '.' + classProp + ' (' + _path2.default.basename(dataType) + ')\n           An empty object will be provided, but tests can fail\n'));
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
      _NodeSpringUtil2.default.error(_cliColor2.default.yellow.bold('  WARNING:'), _cliColor2.default.yellow('The declared mock for ' + testClass.name + '.' + mocksToInject[dataType].testClassProperty + ' is not required on ' + objectToTest.instance.constructor.name + '\n'));
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

          _NodeSpringUtil2.default.log(_cliColor2.default.red('  ' + _cliColor2.default.red.bold(failedSymbol), method));
          _NodeSpringUtil2.default.log(_cliColor2.default.red('   ', assertInstance.ok.lastStack), '\n');

          methodStatus.failed.push(method);
          resolve();
          assertInstance.ok.lastStack = null;
        } else {
          _NodeSpringUtil2.default.log(_cliColor2.default.green('  ' + _cliColor2.default.green.bold(passedSymbol), method), '\n');

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

    if (methodStatus.failed.length > 0) _NodeSpringUtil2.default.log(' ', _cliColor2.default.red(methodStatus.failed.length, 'of', testMethods.length, 'tests failed'));else _NodeSpringUtil2.default.log(' ', _cliColor2.default.blue('All tests have passed!'));

    _NodeSpringUtil2.default.log(_cliColor2.default.blue.bold('  Time:'), _cliColor2.default.yellow(timeStr), '\n');
  });
}

function Mock(type) {
  if (!type || !_NodeSpringUtil2.default.isClass(type)) {
    throw new _NodeSpringException2.default('@Mock expects an Interface but an ' + type + ' was received.', this, 2);
  }

  if (type.moduleType !== 'interface' && type.moduleType !== 'service') {
    throw new _NodeSpringException2.default('Mock expects an Interface or a Service as a parameter, instead ' + (type.name ? type.name : 'unknown') + ' was received', this, 2);
  }

  return function (target, property, descriptor) {
    var interfaceMethods = Object.getOwnPropertyNames(type.prototype);
    var mockInstance = {};

    interfaceMethods.forEach(function (method) {
      mockInstance[method] = function () {};
    });

    descriptor.writable = true;

    mocksToInject[type.packagePath] = {
      testClassProperty: property,
      used: false,
      instance: mockInstance
    };
  };
}

function Test(target, property, descriptor) {
  if (typeof target[property] !== 'function') {
    throw new _NodeSpringException2.default('@Test expects a method but an ' + descriptor.value + ' was received.', this, 2);
  }

  descriptor.value.testMethod = true;
}

function Before(target, property, descriptor) {
  if (typeof target[property] !== 'function') {
    throw new _NodeSpringException2.default('@Before expects a method but an ' + descriptor.value + ' was received.', this, 2);
  }

  descriptor.value.beforeMethod = true;
}

function InjectMocks(type) {
  if (!type || !_NodeSpringUtil2.default.isClass(type)) {
    throw new _NodeSpringException2.default('@InjectMocks expects an Implementation but an ' + type + ' was received.', this, 2);
  }

  return function (target, property, descriptor) {
    descriptor.writable = true;

    var metaInstance = void 0;
    var instance = void 0;

    switch (type.moduleType) {

      case 'implementation':
        metaInstance = _ModuleContainer2.default.getModuleContainer()[type.interfacePackagePath];
        instance = metaInstance.impl;
        break;

      case 'service':
        metaInstance = _ModuleContainer2.default.getModuleContainer()[type.packagePath];
        instance = metaInstance.impl;
        break;

      case 'controller':
        metaInstance = _ModuleContainer2.default.getModuleContainer()[type.packagePath];
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