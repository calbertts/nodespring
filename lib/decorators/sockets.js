'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SocketListener = SocketListener;

var _ModuleContainer = require('../core/ModuleContainer');

var _ModuleContainer2 = _interopRequireDefault(_ModuleContainer);

var _NodeSpringUtil = require('../core/NodeSpringUtil');

var _NodeSpringUtil2 = _interopRequireDefault(_NodeSpringUtil);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function SocketListener() {

  var basePackagePath = _path2.default.dirname(_NodeSpringUtil2.default.getStack().replace(_ModuleContainer2.default.appDir, '').replace('.js', ''));
  var options = {};

  var addSocketListener = function addSocketListener(target, property, descriptor) {
    var packagePath = basePackagePath + '/' + target.constructor.name;
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
} /**
   * Decorators for Socket events
   * @author calbertts
   */
//# sourceMappingURL=sockets.js.map