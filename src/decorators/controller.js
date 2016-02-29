/**
 * Controller decorator
 * @author calbertts
 */

import ModuleContainer from '../core/moduleContainer'
import NodeSpringUtil from '../core/NodeSpringUtil'


export function Controller() {

  let args = arguments[0]
  let options = {}

  let addModule = (target) => {
    target.moduleType = 'controller'
    ModuleContainer.addController(target, options.path || target.name)
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
