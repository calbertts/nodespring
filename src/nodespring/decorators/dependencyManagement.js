/**
 * Dependency Management
 *
 * @author calbertts
 */

import {ModuleContainer} from '../core/moduleContainer'

global.implContext = null

export function Inject(typeToInject) {

  console.log('analizing dependency', typeToInject.name, ' for ', global.implContext)

  return (target, property, descriptor) => {
    descriptor.writable = true

    let targetName = global.implContext ? global.implContext : target.constructor.name

    console.log('executing dependency', typeToInject.name, ' for ', targetName)

    ModuleContainer.addDependency(targetName, property, typeToInject.name)
  }
}

export function Implements(type) {
  global.implContext = type.name
  console.log('analizing implementation', type.name)

  return (target, property, descriptor) => {
    console.log('executing implementation', type.name, ' for ', target.name)

    ModuleContainer.addImplementation(type.name, target)
  }
}