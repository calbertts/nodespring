/**
 * Dependency Management
 * @author calbertts
 */

import ModuleContainer from '../core/ModuleContainer'
import path from 'path'
import Abstract from '../core/Abstract'
import NodeSpringUtil from '../core/NodeSpringUtil'
import NodeSpringException from '../exceptions/NodeSpringException'
import util from 'util'


global.implContext = null


/**
 * Enumeration to specify the scope type for implementations
 * @type {{SINGLETON: string, PROTOTYPE: string}}
 */
export var Scope = {
  SINGLETON: 'singleton',
  PROTOTYPE: 'prototype'
}


/**
 * Decorator to inject a dependency using an interface
 * @param typeToInject
 * @returns {Function}
 * @constructor
 */
export function Inject(typeToInject) {

  let packagePath = NodeSpringUtil.getStack().replace(ModuleContainer.appDir, '').replace('.js', '')

  return (target, property, descriptor) => {
    descriptor.writable = true

    let targetName = global.implContext ? global.implContext.packagePath : packagePath
    let preConfiguredImpl = ModuleContainer.implConfig[targetName]

    //NodeSpringUtil.log('inject:', targetName)

    if(preConfiguredImpl) {
      if(path.basename(packagePath) !== path.basename(preConfiguredImpl)) {
        console.error('Ignored implementation from @Inject ' + packagePath)
        return
      }
    }

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
export function Implements(type, scope = Scope.SINGLETON) {
  global.implContext = type

  //NodeSpringUtil.log('Impl context:', type.packagePath)

  return (target, property, descriptor) => {
    target.scope = scope
    target.interfaceName = type.name
    target.interfacePackagePath = type.packagePath
    target.moduleType = 'implementation'

    global.implContext = null

    //NodeSpringUtil.log('implements:', target.name)

    //NodeSpringUtil.log('type.packagePath', type.packagePath)
    //NodeSpringUtil.log('preConfiguredImpl', ModuleContainer.implConfig)

    let preConfiguredImpl = ModuleContainer.implConfig[type.packagePath]

    //NodeSpringUtil.log('..preConfiguredImpl', preConfiguredImpl)
    //NodeSpringUtil.log('target.name', target.name)

    //NodeSpringUtil.log(target.name, '!==', path.basename(preConfiguredImpl))

    if(preConfiguredImpl) {
      if(target.name !== path.basename(preConfiguredImpl)) {
        NodeSpringUtil.error('Ignored implementation from @Implements ' + target.name)
        return
      }
    }

    /*let interfaceMethods = Object.getOwnPropertyNames(type.prototype)
    let implMethods = Object.getOwnPropertyNames(target.prototype)

    class ImplementationWrapper {
      //impl = new target()

      static scope = scope
      static interfaceName = type.name
      static interfacePackagePath = type.packagePath
      static moduleType = 'implementation'
    }

    implMethods.forEach((implMethod) => {
      if(interfaceMethods.indexOf(implMethod) < 0 && implMethod !== 'init') {
        let exceptionFn = () => {
          let stack = NodeSpringUtil.getStack()
          console.log(stack);
          let methodNotDeclared = new NodeSpringException('The method "' + implMethod + '", is not declared on the interface "' + type.name + '", so you cannot call it from here', this, 2)
          NodeSpringUtil.throwNodeSpringException(methodNotDeclared)
        }

        Object.defineProperty(exceptionFn, 'name', {
          value: implMethod,
          configurable: true
        })

        ImplementationWrapper.prototype[implMethod] = exceptionFn
      } else {
        console.log('ARGS:', NodeSpringUtil.getArgs(target.prototype[implMethod]))

        let fnArgs = NodeSpringUtil.getArgs(target.prototype[implMethod])

        let s = Symbol('type')

        ImplementationWrapper.prototype[implMethod] = (s) => {
          return target.prototype[implMethod].apply(this, arguments)
        }

        ImplementationWrapper.prototype[implMethod] = target.prototype[implMethod]
      }
    })

    //console.log('target', target.prototype)
    //console.log('ImplementationWrapper', ImplementationWrapper.prototype)*/

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
  let packagePath = NodeSpringUtil.getStack().replace(ModuleContainer.appDir, '').replace('.js', '')

  //NodeSpringUtil.log('packagePath', packagePath)
  //sNodeSpringUtil.log('interface:', interfaceBase.name)

  class MockedInterface extends Abstract {
    static moduleType = 'interface'
    static packagePath = packagePath

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
  ModuleContainer.addPostInjectMethod(global.implContext.packagePath, property)
}
