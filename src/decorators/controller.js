/**
 * Controller decorator
 * @author calbertts
 */

import ModuleContainer from '../core/ModuleContainer'
import NodeSpringUtil from '../core/NodeSpringUtil'
import path from 'path'


export function Controller() {

  let basePackagePath = path.dirname(NodeSpringUtil.getStack().replace(ModuleContainer.appDir, '').replace('.js', ''))

  let args = arguments[0]
  let options = {}

  let addModule = (target) => {
    let packagePath = basePackagePath + '/' + target.name

    target.packagePath = packagePath
    target.moduleType = 'controller'
    ModuleContainer.addController(target, options.path || target.name, options.namespace || target.name)
  }

  if(arguments.length === 0 || (arguments.length === 1 && !NodeSpringUtil.isClass(arguments[0]))) {
    options = arguments[0] || {}
    return addModule
  } else {
    let target = arguments[0]
    target.type = 'controller'

    addModule(target)
  }
}
