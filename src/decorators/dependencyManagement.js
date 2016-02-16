/**
 * Dependency Management
 *
 * @author calbertts
 */

import {ModuleContainer} from '../core/moduleContainer'

global.implContext = null

export function Inject(typeToInject) {

  //console.log('analizing dependency', typeToInject.name, ' for ', global.implContext ? global.implContext.name : 'bad')

  return (target, property, descriptor) => {
    descriptor.writable = true

    let targetName = global.implContext ? global.implContext.name : target.constructor.name

    //console.log('executing dependency', typeToInject.name, ' for ', targetName)

    ModuleContainer.addDependency(targetName, property, typeToInject.name)
  }
}

export function Implements(type) {
  global.implContext = type

  //console.log('analizing implementation', type.name)

  return (target, property, descriptor) => {
    //console.log('executing implementation', type.name, ' for ', target.name)
    target.interfaceName = type.name
    global.implContext = null

    ModuleContainer.addImplementation(type, target)
  }
}

export function Interface(interfaceBase) {
  let interfaceClass = arguments[0]
  interfaceBase.isInterface = true

  /*interfaceClass.prototype.constructor = new Function(interfaceClass.name, " return function " + interfaceClass.name + "(){ "+
    "throw TypeError('NodeSpring Error: Cannot construct "+interfaceClass.name+" instances directly, because it is an Interface')}")
  ()*/

  return interfaceClass.prototype.constructor
}