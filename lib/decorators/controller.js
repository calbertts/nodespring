'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Controller = Controller;

var _ModuleContainer = require('../core/ModuleContainer');

var _ModuleContainer2 = _interopRequireDefault(_ModuleContainer);

var _NodeSpringUtil = require('../core/NodeSpringUtil');

var _NodeSpringUtil2 = _interopRequireDefault(_NodeSpringUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Controller decorator
 * @author calbertts
 */

function Controller() {

  var packagePath = _NodeSpringUtil2.default.getStack().replace(_ModuleContainer2.default.appDir, '').replace('.js', '');

  var args = arguments[0];
  var options = {};

  var addModule = function addModule(target) {
    target.packagePath = packagePath;
    target.moduleType = 'controller';
    _ModuleContainer2.default.addController(target, options.path || target.name, options.namespace || target.name);
  };

  if (arguments.length === 0 || arguments.length === 1 && !_NodeSpringUtil2.default.isClass(arguments[0])) {
    options = arguments[0] || {};
    return addModule;
  } else {
    var target = arguments[0];
    target.type = 'controller';

    addModule(target);
  }
}
//# sourceMappingURL=controller.js.map