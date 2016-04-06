'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function NodeSpringException(message, stackStartFunction, stackOffset, stackLimit) {
  var _this = this;

  this.message = message;
  this.name = 'NodeSpringException';
  this.stackStartFunction = stackStartFunction;

  if (stackOffset !== undefined) {
    Error.prepareStackTrace = function (err, stack) {
      var stack2 = stack.slice(stackOffset, stackLimit || stack.length);

      if (global.NodeSpringConfig.printExceptions) {
        console.error('\n', _this.name, message);
        stack2.forEach(function (frame) {
          console.error('    at %s (%s:%d:%d)', frame.getFunctionName() || 'anonymous', frame.getFileName(), frame.getLineNumber(), frame.getColumnNumber());
        });
      }
    };
  }

  Error.captureStackTrace(this, stackStartFunction);
} /**
   * NodeSpringExceptions
   *
   * @param options
   * @constructor
   */

_util2.default.inherits(NodeSpringException, Error);

exports.default = NodeSpringException;
//# sourceMappingURL=NodeSpringException.js.map