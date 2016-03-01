/**
 * NodeSpringUtil
 * @author calbertts
 */

import fs from 'fs'
import util from 'util'

export default class NodeSpringUtil {

  /**
   * Method to get the arguments' names
   *
   * @param func
   * @returns {Array.<String>}
   */
  static getArgs (func) {

    // First match everything inside the function argument parens.
    let args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1]

    // Split the arguments string into an array comma delimited.
    return args.split(',').map((arg) => {

      // Ensure no inline comments are parsed and trim the whitespace.
      return arg.replace(/\/\*.*\*\//, '').trim()
    }).filter((arg) => {

      // Ensure no undefined values are added.
      return arg
    })
  }

  /**
   * Send all the console.log/error output to a file
   * This is pretty useful to see a synchronous log
   */
  static configureLoggingOut() {
    let logFile = fs.createWriteStream('nodespring.log', { flags: 'w' });
    let logStdout = process.stdout;

    console.log = function () {
      logFile.write(util.format.apply(null, arguments) + '\n');
      logStdout.write(util.format.apply(null, arguments) + '\n');
    }
    console.error = console.log;
  }

  /**
   * This method gives a specific format for exceptions and stop the application
   *
   * @param exception Exception to throw
   */
  static throwNodeSpringException(exception) {

    if(typeof exception.stack === 'string') {
      console.error('\n', exception.stack)
    }/* else {
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

    throw exception
  }

  /**
   * Method to check if a value is a class
   *
   * @param param Any kind of object to check if it's a class
   * @returns {*|boolean}
   */
  static isClass(param) {
    return param && param.constructor === Function
  }
}
