'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Inject = Inject;
exports.Implements = Implements;
exports.Interface = Interface;
exports.PostInject = PostInject;

var _moduleContainer = require('../core/moduleContainer');

global.implContext = null; /**
                            * Dependency Management
                            *
                            * @author calbertts
                            */

function Inject(typeToInject) {

  //console.log('analizing dependency', typeToInject.name, ' for ', global.implContext ? global.implContext.name : 'bad')

  return function (target, property, descriptor) {
    descriptor.writable = true;

    var targetName = global.implContext ? global.implContext.name : target.constructor.name;

    //console.log('executing dependency', typeToInject.name, ' for ', targetName)

    _moduleContainer.ModuleContainer.addDependency(targetName, property, typeToInject);
  };
}

function Implements(type) {
  global.implContext = type;

  //console.log('analizing implementation', type.name)

  return function (target, property, descriptor) {
    //console.log('executing implementation', type.name, ' for ', target.name)
    target.interfaceName = type.name;
    target.moduleType = 'implementation';

    global.implContext = null;

    _moduleContainer.ModuleContainer.addImplementation(type, target);
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
  _moduleContainer.ModuleContainer.addPostInjectMethod(global.implContext.name, property);
}
//# sourceMappingURL=dependencyManagement.js.map