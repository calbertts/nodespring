'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var fs = require('fs');
var util = require('util');

var NodeSpringUtil = {

  /**
   * Method to get the arguments' names
   *
   * @param func
   * @returns {Array.<String>}
   */
  getArgs: function getArgs(func) {

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
  },

  configureLoggingOut: function configureLoggingOut() {
    var logFile = fs.createWriteStream('nodespring.log', { flags: 'w' });
    var logStdout = process.stdout;

    console.log = function () {
      logFile.write(util.format.apply(null, arguments) + '\n');
      logStdout.write(util.format.apply(null, arguments) + '\n');
    };
    console.error = console.log;
  }
};

exports.default = NodeSpringUtil;
//# sourceMappingURL=nodeSpringUtil.js.map