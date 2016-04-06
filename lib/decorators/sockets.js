'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SocketListener = SocketListener;

var _ModuleContainer = require('../core/ModuleContainer');

var _ModuleContainer2 = _interopRequireDefault(_ModuleContainer);

var _NodeSpringUtil = require('../core/NodeSpringUtil');

var _NodeSpringUtil2 = _interopRequireDefault(_NodeSpringUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Decorators for Socket events
 * @author calbertts
 */

function SocketListener() {

  var packagePath = _NodeSpringUtil2.default.getStack().replace(_ModuleContainer2.default.appDir, '').replace('.js', '');
  var options = {};

  var addSocketListener = function addSocketListener(target, property, descriptor) {
    target.packagePath = packagePath;

    _ModuleContainer2.default.addSocketListener(target, property, options);
  };

  if (arguments.length <= 1) {
    options = arguments[0];

    return addSocketListener;
  } else {
    var target = arguments[0];
    var property = arguments[1];
    var descriptor = arguments[2];

    addSocketListener(target, property, descriptor);
  }
}
//# sourceMappingURL=sockets.js.map