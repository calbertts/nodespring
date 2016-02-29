/**
 * Dependency Management
 * @author calbertts
 */

import ModuleContainer from '../core/moduleContainer'


global.implContext = null

export function Inject(typeToInject) {

  return (target, property, descriptor) => {
    descriptor.writable = true

    let targetName = global.implContext ? global.implContext.name : target.constructor.name

    if(typeToInject.moduleType === 'controller') {
      throw new TypeError('You cannot inject a Controller as a dependency, please take a look on ' + targetName)
    }

    ModuleContainer.addDependency(targetName, property, typeToInject)
  }
}

export function Implements(type, scope = 'singleton') {
  global.implContext = type

  return (target, property, descriptor) => {
    target.scope = scope
    target.interfaceName = type.name
    target.moduleType = 'implementation'

    global.implContext = null

    ModuleContainer.addImplementation(type, target)
  }
}

export function Interface(interfaceBase) {
  let interfaceClass = arguments[0]
  interfaceBase.moduleType = 'interface'

  /*interfaceClass.prototype.constructor = new Function(interfaceClass.name, " return function " + interfaceClass.name + "(){ "+
    "throw TypeError('NodeSpring Error: Cannot construct "+interfaceClass.name+" instances directly, because it is an Interface')}")
  ()*/

  return interfaceClass.prototype.constructor
}

export function PostInject(target, property, descriptor) {
  ModuleContainer.addPostInjectMethod(global.implContext.name, property)
}

export var Scope = {
  SINGLETON: 'singleton',
  PROTOTYPE: 'prototype'
}