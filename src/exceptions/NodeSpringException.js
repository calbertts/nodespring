/**
 * NodeSpringExceptions
 *
 * @param options
 * @constructor
 */

import util from 'util'


function NodeSpringException(message, stackStartFunction, stackOffset, stackLimit) {
  this.message = message
  this.name = 'NodeSpringException'
  this.stackStartFunction = stackStartFunction

  if(stackOffset !== undefined) {
    Error.prepareStackTrace = (err, stack) => {
      let stack2 = stack.slice(stackOffset, stackLimit || stack.length)

      if(global.NodeSpringConfig.printExceptions) {
        console.error('\n', this.name, message)
        stack2.forEach((frame) => {
          console.error('    at %s (%s:%d:%d)'
            , frame.getFunctionName() || 'anonymous'
            , frame.getFileName()
            , frame.getLineNumber()
            , frame.getColumnNumber()
          )
        })
      }
    }
  }

  Error.captureStackTrace(this, stackStartFunction)
}

util.inherits(NodeSpringException, Error)

export default NodeSpringException