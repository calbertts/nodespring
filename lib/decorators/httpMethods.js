'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Get = Get;
exports.Post = Post;

var _moduleContainer = require('../core/moduleContainer');

var _moduleContainer2 = _interopRequireDefault(_moduleContainer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Get() {

  var options = {
    contentType: 'text/html'
  };

  var addRoute = function addRoute(target, property, descriptor) {
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
} /**
   * Decorators for HTTP Methods
   * @author calbertts
   */

function Post() {

  var options = {
    contentType: 'text/html'
  };

  var addRoute = function addRoute(target, property, descriptor) {
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