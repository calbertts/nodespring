'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /**
                                                                                                                                                                                                                                                   * Decorators for HTTP Methods
                                                                                                                                                                                                                                                   * @author calbertts
                                                                                                                                                                                                                                                   */

exports.Get = Get;
exports.Post = Post;

var _ModuleContainer = require('../core/ModuleContainer');

var _ModuleContainer2 = _interopRequireDefault(_ModuleContainer);

var _NodeSpringUtil = require('../core/NodeSpringUtil');

var _NodeSpringUtil2 = _interopRequireDefault(_NodeSpringUtil);

var _NodeSpringException = require('../exceptions/NodeSpringException');

var _NodeSpringException2 = _interopRequireDefault(_NodeSpringException);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Get() {

  var basePackagePath = _path2.default.dirname(_NodeSpringUtil2.default.getStack().replace(_ModuleContainer2.default.appDir, '').replace('.js', ''));
  var options = {
    contentType: 'text/html'
  };

  var addRoute = function addRoute(target, property, descriptor) {
    var packagePath = basePackagePath + '/' + target.constructor.name;

    target.packagePath = packagePath;
    _ModuleContainer2.default.addRoute(target, property, 'get', options.contentType);
  };

  if (arguments.length <= 1) {
    if (_typeof(arguments[0]) !== 'object') {
      throw new _NodeSpringException2.default('The options passed to @Get are not valid', this, 2);
    }

    options = arguments[0] || {};
    options.contentType = !options.contentType ? 'text/html' : options.contentType;

    return addRoute;
  } else {
    var target = arguments[0];
    var property = arguments[1];
    var descriptor = arguments[2];

    if (typeof target[property] !== 'function') {
      throw new _NodeSpringException2.default('@Get expects a method but "' + property + '" was received.', this, 2);
    }

    addRoute(target, property, descriptor);
  }
}

function Post() {

  var basePackagePath = _path2.default.dirname(_NodeSpringUtil2.default.getStack().replace(_ModuleContainer2.default.appDir, '').replace('.js', ''));
  var options = {
    contentType: 'text/html'
  };

  var addRoute = function addRoute(target, property, descriptor) {
    var packagePath = basePackagePath + '/' + target.constructor.name;

    target.packagePath = packagePath;
    _ModuleContainer2.default.addRoute(target, property, 'post', options.contentType);
  };

  if (arguments.length <= 1) {
    if (_typeof(arguments[0]) !== 'object') {
      throw new _NodeSpringException2.default('The options passed to @Post is not valid', this, 2);
    }

    options = arguments[0] || {};
    options.contentType = !options.contentType ? 'text/html' : options.contentType;

    return addRoute;
  } else {
    var target = arguments[0];
    var property = arguments[1];
    var descriptor = arguments[2];

    if (typeof target[property] !== 'function') {
      throw new _NodeSpringException2.default('@Post expects a method but "' + property + '" was received.', this, 2);
    }

    addRoute(target, property, descriptor);
  }
}
//# sourceMappingURL=httpMethods.js.map