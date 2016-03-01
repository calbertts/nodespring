'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Scope = undefined;
exports.Inject = Inject;
exports.Implements = Implements;
exports.Interface = Interface;
exports.PostInject = PostInject;

var _moduleContainer = require('../core/moduleContainer');

var _moduleContainer2 = _interopRequireDefault(_moduleContainer);

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
 * Decorator to inject a dependency using an interface
 * @param typeToInject
 * @returns {Function}
 * @constructor
 */
function Inject(typeToInject) {

  return function (target, property, descriptor) {
    descriptor.writable = true;

    var targetName = global.implContext ? global.implContext.name : target.constructor.name;

    if (typeToInject.moduleType === 'controller') {
      throw new TypeError('You cannot inject a Controller as a dependency, please take a look on ' + targetName);
    }

    _moduleContainer2.default.addDependency(targetName, property, typeToInject);
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
  var scope = arguments.length <= 1 || arguments[1] === undefined ? 'singleton' : arguments[1];

  global.implContext = type;

  return function (target, property, descriptor) {
    target.scope = scope;
    target.interfaceName = type.name;
    target.moduleType = 'implementation';

    global.implContext = null;

    _moduleContainer2.default.addImplementation(type, target);
  };
}

/**
 * Decorator to specify a class is an interface
 * @param interfaceBase
 * @returns {MockedInterface}
 * @constructor
 */
function Interface(interfaceBase) {
  var interfaceClass = arguments[0];
  interfaceBase.moduleType = 'interface';

  var MockedInterface = function (_Abstract) {
    _inherits(MockedInterface, _Abstract);

    function MockedInterface() {
      _classCallCheck(this, MockedInterface);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(MockedInterface).call(this));
    }

    return MockedInterface;
  }(_Abstract3.default);

  Object.defineProperty(MockedInterface, 'name', {
    value: interfaceBase.name,
    configurable: true
  });

  var interfaceMethods = Object.getOwnPropertyNames(interfaceBase.prototype);

  interfaceMethods.filter(function (methodName) {
    return methodName !== 'constructor';
  }).forEach(function (method) {
    MockedInterface.prototype[method] = interfaceBase.prototype[method];
  });

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
  _moduleContainer2.default.addPostInjectMethod(global.implContext.name, property);
}

/**
 * Enumeration to specify the scope type for implementations
 * @type {{SINGLETON: string, PROTOTYPE: string}}
 */
var Scope = exports.Scope = {
  SINGLETON: 'singleton',
  PROTOTYPE: 'prototype'
};
//# sourceMappingURL=dependencyManagement.js.map