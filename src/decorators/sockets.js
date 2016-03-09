/**
 * Decorators for Socket events
 * @author calbertts
 */

import ModuleContainer from '../core/ModuleContainer'
import NodeSpringUtil from '../core/NodeSpringUtil'


export function SocketListener() {

  let packagePath = NodeSpringUtil.getStack().replace(ModuleContainer.appDir, '').replace('.js', '')
  let eventName

  let addSocketListener = (target, property, descriptor) => {
    target.packagePath = packagePath

    ModuleContainer.addSocketListener(target, property, eventName)
  }

  if(arguments.length <= 1) {
    eventName = arguments[0]

    return addSocketListener
  } else {
    let target = arguments[0]
    let property = arguments[1]
    let descriptor = arguments[2]

    addSocketListener(target, property, descriptor)
  }
}