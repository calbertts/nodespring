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
      return stack2
    }
  }

  Error.captureStackTrace(this, stackStartFunction)
}

util.inherits(NodeSpringException, Error)

export default NodeSpringException