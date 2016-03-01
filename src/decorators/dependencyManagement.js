/**
 * Dependency Management
 * @author calbertts
 */

import ModuleContainer from '../core/moduleContainer'
import Abstract from '../core/Abstract'
import NodeSpringUtil from '../core/NodeSpringUtil'
import NodeSpringException from '../exceptions/NodeSpringException'
import util from 'util'


global.implContext = null


/**
 * Decorator to inject a dependency using an interface
 * @param typeToInject
 * @returns {Function}
 * @constructor
 */
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


/**
 * Decorator to specify when a class implements a specific interface
 * @param type
 * @param scope
 * @returns {Function}
 * @constructor
 */
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


/**
 * Decorator to specify a class is an interface
 * @param interfaceBase
 * @returns {MockedInterface}
 * @constructor
 */
export function Interface(interfaceBase) {
  let interfaceClass = arguments[0]
  interfaceBase.moduleType = 'interface'

  class MockedInterface extends Abstract {
    constructor() {
      super()
    }
  }

  Object.defineProperty(MockedInterface, 'name', {
    value: interfaceBase.name,
    configurable: true
  })

  let interfaceMethods = Object.getOwnPropertyNames(interfaceBase.prototype)

  interfaceMethods.filter((methodName) => {
    return methodName !== 'constructor'
  }).forEach((method) => {
    MockedInterface.prototype[method] = interfaceBase.prototype[method]
  })

  return MockedInterface
}


/**
 * Decorator to indicate a method which must be called after all dependencies are injected
 * @param target
 * @param property
 * @param descriptor
 * @constructor
 */
export function PostInject(target, property, descriptor) {
  ModuleContainer.addPostInjectMethod(global.implContext.name, property)
}


/**
 * Enumeration to specify the scope type for implementations
 * @type {{SINGLETON: string, PROTOTYPE: string}}
 */
export var Scope = {
  SINGLETON: 'singleton',
  PROTOTYPE: 'prototype'
}