'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Get = Get;
exports.Post = Post;

var _moduleContainer = require('../core/moduleContainer');

function Get() {

  var options = {
    contentType: 'text/html'
  };

  var addRoute = function addRoute(target, property, descriptor) {
    _moduleContainer.ModuleContainer.addRoute(target, property, 'get', options.contentType);
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
   * HTTP Methods
   *
   * @author calbertts
   */

function Post() {

  var options = {
    contentType: 'text/html'
  };

  var addRoute = function addRoute(target, property, descriptor) {
    _moduleContainer.ModuleContainer.addRoute(target, property, 'post', options.contentType);
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