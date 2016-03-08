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

  var packagePath = _NodeSpringUtil2.default.getStack().replace(_ModuleContainer2.default.appDir, '').replace('.js', '');

  return function (target, property, descriptor) {
    descriptor.writable = true;

    var targetName = global.implContext ? global.implContext.packagePath : packagePath;
    var preConfiguredImpl = _ModuleContainer2.default.implConfig[targetName];

    //NodeSpringUtil.log('inject:', targetName)

    if (preConfiguredImpl) {
      if (_path2.default.basename(packagePath) !== _path2.default.basename(preConfiguredImpl)) {
        console.error('Ignored implementation from @Inject ' + packagePath);
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

  global.implContext = type;

  //NodeSpringUtil.log('Impl context:', type.packagePath)

  return function (target, property, descriptor) {
    target.scope = scope;
    target.interfaceName = type.name;
    target.interfacePackagePath = type.packagePath;
    target.moduleType = 'implementation';

    global.implContext = null;

    //NodeSpringUtil.log('implements:', target.name)

    //NodeSpringUtil.log('type.packagePath', type.packagePath)
    //NodeSpringUtil.log('preConfiguredImpl', ModuleContainer.implConfig)

    var preConfiguredImpl = _ModuleContainer2.default.implConfig[type.packagePath];

    //NodeSpringUtil.log('..preConfiguredImpl', preConfiguredImpl)
    //NodeSpringUtil.log('target.name', target.name)

    //NodeSpringUtil.log(target.name, '!==', path.basename(preConfiguredImpl))

    if (preConfiguredImpl) {
      if (target.name !== _path2.default.basename(preConfiguredImpl)) {
        _NodeSpringUtil2.default.error('Ignored implementation from @Implements ' + target.name);
        return;
      }
    }

    /*let interfaceMethods = Object.getOwnPropertyNames(type.prototype)
    let implMethods = Object.getOwnPropertyNames(target.prototype)
     class ImplementationWrapper {
      //impl = new target()
       static scope = scope
      static interfaceName = type.name
      static interfacePackagePath = type.packagePath
      static moduleType = 'implementation'
    }
     implMethods.forEach((implMethod) => {
      if(interfaceMethods.indexOf(implMethod) < 0 && implMethod !== 'init') {
        let exceptionFn = () => {
          let stack = NodeSpringUtil.getStack()
          console.log(stack);
          let methodNotDeclared = new NodeSpringException('The method "' + implMethod + '", is not declared on the interface "' + type.name + '", so you cannot call it from here', this, 2)
          NodeSpringUtil.throwNodeSpringException(methodNotDeclared)
        }
         Object.defineProperty(exceptionFn, 'name', {
          value: implMethod,
          configurable: true
        })
         ImplementationWrapper.prototype[implMethod] = exceptionFn
      } else {
        console.log('ARGS:', NodeSpringUtil.getArgs(target.prototype[implMethod]))
         let fnArgs = NodeSpringUtil.getArgs(target.prototype[implMethod])
         let s = Symbol('type')
         ImplementationWrapper.prototype[implMethod] = (s) => {
          return target.prototype[implMethod].apply(this, arguments)
        }
         ImplementationWrapper.prototype[implMethod] = target.prototype[implMethod]
      }
    })
     //console.log('target', target.prototype)
    //console.log('ImplementationWrapper', ImplementationWrapper.prototype)*/

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
  var _class, _temp;

  var packagePath = _NodeSpringUtil2.default.getStack().replace(_ModuleContainer2.default.appDir, '').replace('.js', '');

  //NodeSpringUtil.log('packagePath', packagePath)
  //sNodeSpringUtil.log('interface:', interfaceBase.name)

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
  _ModuleContainer2.default.addPostInjectMethod(global.implContext.packagePath, property);
}
//# sourceMappingURL=dependencyManagement.js.map