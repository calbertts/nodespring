/**
 * Dependency Management
 *
 * @author calbertts
 */

import {ModuleContainer} from '../core/moduleContainer'

export function Inject(typeToInject) {

  return (target, property, descriptor) => {
    descriptor.configurable = false
    descriptor.writable = true
    descriptor.enumerable = false

    let promiseModuleInstanceLoad = ModuleContainer.getModuleInstance(target.constructor.name)
    let promiseImplLoad = ModuleContainer.getModuleImpl(typeToInject)

    promiseModuleInstanceLoad.then((moduleInstance) => {
      promiseImplLoad.then((impl) => {
        moduleInstance[property] = new impl()
      })
    })
  }
}

export function Interface(type) {
  // Validation stuff

  ModuleContainer.addInterface(type, null)
}

export function Implements(type) {
  return (target, property, descriptor) => {
    ModuleContainer.addImplementation(type, target)
  }
}