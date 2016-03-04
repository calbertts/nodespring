'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Get = Get;
exports.Post = Post;

var _moduleContainer = require('../core/moduleContainer');

var _moduleContainer2 = _interopRequireDefault(_moduleContainer);

var _NodeSpringUtil = require('../core/NodeSpringUtil');

var _NodeSpringUtil2 = _interopRequireDefault(_NodeSpringUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Decorators for HTTP Methods
 * @author calbertts
 */

function Get() {

  var packagePath = _NodeSpringUtil2.default.getStack().replace(_moduleContainer2.default.appDir, '').replace('.js', '');
  var options = {
    contentType: 'text/html'
  };

  var addRoute = function addRoute(target, property, descriptor) {
    target.packagePath = packagePath;
    _moduleContainer2.default.addRoute(target, property, 'get', options.contentType);
  };

  if (arguments.length <= 1) {
    options = arguments[0] || {};
    options.contentType = !options.contentType ? 'text/html' : options.contentType;

    return addRoute;
  } else {
    var target = arguments[0];
    var property = arguments[1];
    var descriptor = arguments[2];

    addRoute(target, property, descriptor);
  }
}

function Post() {

  var packagePath = _NodeSpringUtil2.default.getStack().replace(_moduleContainer2.default.appDir, '').replace('.js', '');
  var options = {
    contentType: 'text/html'
  };

  var addRoute = function addRoute(target, property, descriptor) {
    target.packagePath = packagePath;
    _moduleContainer2.default.addRoute(target, property, 'post', options.contentType);
  };

  if (arguments.length <= 1) {
    options = arguments[0] || {};
    options.contentType = !options.contentType ? 'text/html' : options.contentType;

    return addRoute;
  } else {
    var target = arguments[0];
    var property = arguments[1];
    var descriptor = arguments[2];

    addRoute(target, property, descriptor);
  }
}
//# sourceMappingURL=httpMethods.js.map