'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Scope = undefined;
exports.Inject = Inject;
exports.Implements = Implements;
exports.Interface = Interface;
exports.PostInject = PostInject;

var _ModuleContainer = require('../core/ModuleContainer');

var _ModuleContainer2 = _interopRequireDefault(_ModuleContainer);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _Abstract2 = require('../core/Abstract');

var _Abstract3 = _interopRequireDefault(_Abstract2);

var _NodeSpringUtil = require('../core/NodeSpringUtil');

var _NodeSpringUtil2 = _interopRequireDefault(_NodeSpringUtil);

var _NodeSpringException = require('../exceptions/NodeSpringException');

var _NodeSpringException2 = _interopRequireDefault(_NodeSpringException);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Dependency Management
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author calbertts
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

global.implContext = null;

/**
 * Enumeration to specify the scope type for implementations
 * @type {{SINGLETON: string, PROTOTYPE: string}}
 */
var Scope = exports.Scope = {
  SINGLETON: 'singleton',
  PROTOTYPE: 'prototype'
};

/**
 * Decorator to inject a dependency using an interface
 * @param typeToInject
 * @returns {Function}
 * @constructor
 */
function Inject(typeToInject) {
  if (!typeToInject || !_NodeSpringUtil2.default.isClass(typeToInject)) {
    throw new _NodeSpringException2.default('@Inject expects an Interface but an ' + typeToInject + ' was received.', this, 2);
  }

  var basePackagePath = _path2.default.dirname(_NodeSpringUtil2.default.getStack().replace(_ModuleContainer2.default.appDir, '').replace('.js', ''));

  return function (target, property, descriptor) {
    var packagePath = basePackagePath + '/' + target.constructor.name;

    descriptor.writable = true;

    var targetName = global.implContext ? global.implContext.packagePath : packagePath;
    var preConfiguredImpl = _ModuleContainer2.default.implConfig[targetName];

    //NodeSpringUtil.debug('inject:', targetName)

    if (preConfiguredImpl) {
      if (_path2.default.basename(packagePath) !== _path2.default.basename(preConfiguredImpl)) {
        _NodeSpringUtil2.default.error('Ignored implementation from @Inject ' + packagePath);
        return;
      }
    }

    if (typeToInject.moduleType === 'controller') {
      throw new TypeError('You cannot inject a Controller as a dependency, please take a look on ' + targetName);
    }

    _ModuleContainer2.default.addDependency(targetName, property, typeToInject);
  };
}

/**
 * Decorator to specify when a class implements a specific interface
 * @param type
 * @param scope
 * @returns {Function}
 * @constructor
 */
function Implements(type) {
  var scope = arguments.length <= 1 || arguments[1] === undefined ? Scope.SINGLETON : arguments[1];

  if (!type || !_NodeSpringUtil2.default.isClass(type)) {
    throw new _NodeSpringException2.default('@Implements expects a Class but an ' + type + ' was received.', this, 2);
  }

  if (scope !== Scope.SINGLETON && scope !== Scope.PROTOTYPE) {
    throw new _NodeSpringException2.default('Invalid Scope for ' + type.name + ', ' + scope + ' was received', this, 2);
  }

  global.implContext = type;

  return function (target, property, descriptor) {
    target.scope = scope;
    target.interfaceName = type.name;
    target.interfacePackagePath = type.packagePath;
    target.moduleType = 'implementation';

    global.implContext = null;

    var preConfiguredImpl = _ModuleContainer2.default.implConfig[type.packagePath];

    if (preConfiguredImpl) {
      if (target.name !== _path2.default.basename(preConfiguredImpl)) {
        _NodeSpringUtil2.default.error('Ignored implementation from @Implements ' + target.name);
        return;
      }
    }

    _ModuleContainer2.default.addImplementation(type, target);
  };
}

/**
 * Decorator to specify a class is an interface
 * @param interfaceBase
 * @returns {MockedInterface}
 * @constructor
 */
function Interface(interfaceBase) {
  var _class,
      _temp,
      _this2 = this;

  if (!interfaceBase || !_NodeSpringUtil2.default.isClass(interfaceBase)) {
    throw new _NodeSpringException2.default('@Interface expects a Class but an ' + interfaceBase + ' was received.', this, 2);
  }

  var basePackagePath = _path2.default.dirname(_NodeSpringUtil2.default.getStack().replace(_ModuleContainer2.default.appDir, '').replace('.js', ''));
  var packagePath = basePackagePath + '/' + interfaceBase.name;

  _ModuleContainer2.default.addInterface(packagePath);

  var MockedInterface = (_temp = _class = function (_Abstract) {
    _inherits(MockedInterface, _Abstract);

    function MockedInterface() {
      _classCallCheck(this, MockedInterface);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(MockedInterface).call(this));
    }

    return MockedInterface;
  }(_Abstract3.default), _class.moduleType = 'interface', _class.packagePath = packagePath, _temp);


  Object.defineProperty(MockedInterface, 'name', {
    value: interfaceBase.name,
    configurable: true
  });

  var interfaceMethods = Object.getOwnPropertyNames(interfaceBase.prototype);

  interfaceMethods.filter(function (methodName) {
    return methodName !== 'constructor';
  }).forEach(function (method) {
    if (method === 'getInstance') throw new _NodeSpringException2.default('getInstance(...) is a reserved method for Interfaces, try with other name on ' + interfaceBase.name, _this2, 2);

    MockedInterface.prototype[method] = interfaceBase.prototype[method];
  });

  MockedInterface.getInstance = function () {
    return modulesContainer[packagePath].getInstance();
  };

  return MockedInterface;
}

/**
 * Decorator to indicate a method which must be called after all dependencies are injected
 * @param target
 * @param property
 * @param descriptor
 * @constructor
 */
function PostInject(target, property, descriptor) {
  var basePackagePath = _path2.default.dirname(_NodeSpringUtil2.default.getStack().replace(_ModuleContainer2.default.appDir, '').replace('.js', ''));
  var packagePath = basePackagePath + '/' + target.constructor.name;
  var targetName = global.implContext ? global.implContext.packagePath : packagePath;

  _ModuleContainer2.default.addPostInjectMethod(targetName, property);
}
//# sourceMappingURL=dependencyManagement.js.map