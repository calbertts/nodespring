/**
 * Dependency Management
 *
 * @author calbertts
 */

import {ModuleContainer} from '../core/moduleContainer'

export function Inject(typeToInject) {

  return (target, property, descriptor) => {
    descriptor.writable = true

    let promiseModuleInstanceLoad = ModuleContainer.getModuleInstance(target.constructor.name)
    let promiseImplLoad = ModuleContainer.getModuleImpl(typeToInject)

    promiseModuleInstanceLoad.then((moduleInstance) => {
      promiseImplLoad.then((impl) => {
        moduleInstance[property] = impl

        console.log(`Dependency injected => ${typeToInject.name} into ${target.constructor.name}`)

        // Avoid redefine the injected instance
        Object.defineProperty(moduleInstance, property, {writable: false})
      })
    })
  }
}

export function Interface(type) {
  ModuleContainer.addInterface(type, null)
}

export function Implements(type) {
  return (target, property, descriptor) => {
    ModuleContainer.addImplementation(type, target)
  }
}