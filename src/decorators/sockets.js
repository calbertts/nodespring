/**
 * Decorators for Socket events
 * @author calbertts
 */

import ModuleContainer from '../core/ModuleContainer'
import NodeSpringUtil from '../core/NodeSpringUtil'
import path from 'path'


export function SocketListener() {

  let basePackagePath = path.dirname(NodeSpringUtil.getStack().replace(ModuleContainer.appDir, '').replace('.js', ''))
  let options = {}

  let addSocketListener = (target, property, descriptor) => {
    let packagePath = basePackagePath + '/' + target.constructor.name
    target.packagePath = packagePath

    ModuleContainer.addSocketListener(target, property, options)
  }

  if(arguments.length <= 1) {
    options = arguments[0]

    return addSocketListener
  } else {
    let target = arguments[0]
    let property = arguments[1]
    let descriptor = arguments[2]

    addSocketListener(target, property, descriptor)
  }
}