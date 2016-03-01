'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * NodeSpringUtil
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @author calbertts
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NodeSpringUtil = function () {
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
    value: function configureLoggingOut() {
      var logFile = _fs2.default.createWriteStream('nodespring.log', { flags: 'w' });
      var logStdout = process.stdout;

      console.log = function () {
        logFile.write(_util2.default.format.apply(null, arguments) + '\n');
        logStdout.write(_util2.default.format.apply(null, arguments) + '\n');
      };
      console.error = console.log;
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
      } /* else {
         console.error('\n', exception.name, exception.message)
         exception.stack.forEach((frame) => {
           console.error('    at %s (%s:%d:%d)'
             , frame.getFunctionName() || 'anonymous'
             , frame.getFileName()
             , frame.getLineNumber()
             , frame.getColumnNumber()
           )
         })
        }*/

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
  }]);

  return NodeSpringUtil;
}();

exports.default = NodeSpringUtil;
//# sourceMappingURL=NodeSpringUtil.js.map