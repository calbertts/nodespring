/**
 * NodeSpringUtil
 * @author calbertts
 */

import fs from 'fs'
import util from 'util'

export default class NodeSpringUtil {

  static logging = false
  static loggingSync = false
  static debugging = false

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
  static configureLoggingOut(loggingSync) {
    NodeSpringUtil.loggingSync = loggingSync

    if(NodeSpringUtil.loggingSync)
    {
      let logFile = fs.createWriteStream('nodespring.log', { flags: 'w' })
      let logStdout = process.stdout

      console.log = function () {
        logFile.write(util.format.apply(null, arguments) + '\n')
        logStdout.write(util.format.apply(null, arguments) + '\n')
      }
      console.error = console.log
    }
  }

  static log() {
    if(NodeSpringUtil.logging)
      console.log.apply(this, arguments)
  }

  static error() {
    if(NodeSpringUtil.logging)
      console.error.apply(this, arguments)
  }

  static debug() {
    if(NodeSpringUtil.debugging) {
      console.log.apply(this, arguments)
    }
  }

  /**
   * This method gives a specific format for exceptions and stop the application
   *
   * @param exception Exception to throw
   */
  static throwNodeSpringException(exception) {

    if(typeof exception.stack === 'string') {
      console.error('\n', exception.stack)
    }

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

  /**
   * Returns the stack from the caller discarding the two first elements
   * @returns {void|string|XML|*}
   */
  static getStack() {
    // Save original Error.prepareStackTrace
    var origPrepareStackTrace = Error.prepareStackTrace

    // Override with function that just returns `stack`
    Error.prepareStackTrace = function (_, stack) {
      return stack
    }

    // Create a new `Error`, which automatically gets `stack`
    var err = new Error()

    // Evaluate `err.stack`, which calls our new `Error.prepareStackTrace`
    var stack = err.stack

    // Restore original `Error.prepareStackTrace`
    Error.prepareStackTrace = origPrepareStackTrace

    // Remove superfluous function call on stack
    stack.shift()
    stack.shift()

    if(stack.length > 0) {
      let frame = stack[0]

      return frame.getFileName()
    } else return ''
  }
}
