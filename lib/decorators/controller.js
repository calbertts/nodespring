'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Controller = Controller;

var _moduleContainer = require('../core/moduleContainer');

var isClass = function isClass(arg) {
  return arg && arg.constructor === Function;
};

function Controller() {

  var args = arguments[0];

  //console.log('analizing controller', args.name)

  var options = {};

  var addModule = function addModule(target) {
    //console.log('executing controller', args.name, ' for ', target.name)
    _moduleContainer.ModuleContainer.addController(target, options.path || target.name);
  };

  if (arguments.length === 0 || arguments.length === 1 && !isClass(arguments[0])) {
    options = arguments[0] || {};
    return addModule;
  } else {
    var target = arguments[0];
    target.type = 'controller';

    addModule(target);
  }
}
//# sourceMappingURL=controller.js.map