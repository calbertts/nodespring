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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

global.implContext = null; /**
                            * Dependency Management
                            * @author calbertts
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

function Interface(interfaceBase) {
  var interfaceClass = arguments[0];
  interfaceBase.moduleType = 'interface';

  /*interfaceClass.prototype.constructor = new Function(interfaceClass.name, " return function " + interfaceClass.name + "(){ "+
    "throw TypeError('NodeSpring Error: Cannot construct "+interfaceClass.name+" instances directly, because it is an Interface')}")
  ()*/

  return interfaceClass.prototype.constructor;
}

function PostInject(target, property, descriptor) {
  _moduleContainer2.default.addPostInjectMethod(global.implContext.name, property);
}

var Scope = exports.Scope = {
  SINGLETON: 'singleton',
  PROTOTYPE: 'prototype'
};
//# sourceMappingURL=dependencyManagement.js.map