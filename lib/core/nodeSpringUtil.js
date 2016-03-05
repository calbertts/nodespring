'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp; /**
                    * NodeSpringUtil
                    * @author calbertts
                    */

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NodeSpringUtil = (_temp = _class = function () {
  function NodeSpringUtil() {
    _classCallCheck(this, NodeSpringUtil);
  }

  _createClass(NodeSpringUtil, null, [{
    key: 'getArgs',


    /**
     * Method to get the arguments' names
     *
     * @param func
     * @returns {Array.<String>}
     */
    value: function getArgs(func) {

      // First match everything inside the function argument parens.
      var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];

      // Split the arguments string into an array comma delimited.
      return args.split(',').map(function (arg) {

        // Ensure no inline comments are parsed and trim the whitespace.
        return arg.replace(/\/\*.*\*\//, '').trim();
      }).filter(function (arg) {

        // Ensure no undefined values are added.
        return arg;
      });
    }

    /**
     * Send all the console.log/error output to a file
     * This is pretty useful to see a synchronous log
     */

  }, {
    key: 'configureLoggingOut',
    value: function configureLoggingOut(logging, loggingSync) {
      if (logging) {
        NodeSpringUtil.logging = logging;
      }

      if (loggingSync) {
        (function () {
          NodeSpringUtil.loggingSync;

          var logFile = _fs2.default.createWriteStream('nodespring.log', { flags: 'w' });
          var logStdout = process.stdout;

          console.log = function () {
            logFile.write(_util2.default.format.apply(null, arguments) + '\n');
            logStdout.write(_util2.default.format.apply(null, arguments) + '\n');
          };
          console.error = console.log;
        })();
      }
    }
  }, {
    key: 'log',
    value: function log() {
      if (NodeSpringUtil.logging) console.log.apply(this, arguments);
    }
  }, {
    key: 'error',
    value: function error() {
      if (NodeSpringUtil.logging) console.error.apply(this, arguments);
    }

    /**
     * This method gives a specific format for exceptions and stop the application
     *
     * @param exception Exception to throw
     */

  }, {
    key: 'throwNodeSpringException',
    value: function throwNodeSpringException(exception) {

      if (typeof exception.stack === 'string') {
        console.error('\n', exception.stack);
      }

      throw exception;
    }

    /**
     * Method to check if a value is a class
     *
     * @param param Any kind of object to check if it's a class
     * @returns {*|boolean}
     */

  }, {
    key: 'isClass',
    value: function isClass(param) {
      return param && param.constructor === Function;
    }

    /**
     * Returns the stack from the caller discarding the two first elements
     * @returns {void|string|XML|*}
     */

  }, {
    key: 'getStack',
    value: function getStack() {
      // Save original Error.prepareStackTrace
      var origPrepareStackTrace = Error.prepareStackTrace;

      // Override with function that just returns `stack`
      Error.prepareStackTrace = function (_, stack) {
        return stack;
      };

      // Create a new `Error`, which automatically gets `stack`
      var err = new Error();

      // Evaluate `err.stack`, which calls our new `Error.prepareStackTrace`
      var stack = err.stack;

      // Restore original `Error.prepareStackTrace`
      Error.prepareStackTrace = origPrepareStackTrace;

      // Remove superfluous function call on stack
      stack.shift();
      stack.shift();

      /*stack.forEach((frame) => {
        console.log(frame.getFileName())
      })*/

      var frame = stack[0];

      return frame.getFileName(); //.replace(ModuleContainer.appDir, '')
    }
  }]);

  return NodeSpringUtil;
}(), _class.logging = false, _temp);
exports.default = NodeSpringUtil;
//# sourceMappingURL=NodeSpringUtil.js.map