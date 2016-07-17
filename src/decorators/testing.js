/**
 * Testing decorators
 * @author calbertts
 */

import clc from 'cli-color'
import t from 'exectimer'
import path from 'path'
import assert from '../core/assert'

import ModuleContainer from '../core/ModuleContainer'
import NodeSpringUtil from '../core/NodeSpringUtil'
import NodeSpringException from '../exceptions/NodeSpringException'


let objectToTest = null
let mocksToInject = {}


export function TestClass(testClass) {
  if(!testClass || !NodeSpringUtil.isClass(testClass)) {
    throw new NodeSpringException('@TestClass expects a Class but an ' + testClass + ' was received.', this, 2)
  }

  let testClassObj = new testClass()
  let className = testClassObj.constructor.name

  NodeSpringUtil.logging = true
  NodeSpringUtil.log(clc.blue.bold('NodeSpring Unit Test Runner:', clc.yellow(className, '\n')))

  // Inject mocks into the object to test
  for(let classProp in objectToTest.dependencies) {
    let dataType = objectToTest.dependencies[classProp]

    if(!mocksToInject[dataType]) {
      NodeSpringUtil.error(clc.yellow.bold('  WARNING:'), clc.yellow('There isn\'t a mock for the dependency injected in ' + objectToTest.type.name + '.' + classProp + ' (' + path.basename(dataType) + ')\n           An empty object will be provided, but tests can fail\n'))
      objectToTest.instance[classProp] = {}
    } else {
      objectToTest.instance[classProp] = mocksToInject[dataType].instance
      mocksToInject[dataType].used = true
      testClassObj[mocksToInject[dataType].testClassProperty] = mocksToInject[dataType].instance
    }
  }

  // Check for mocks which aren't required
  for(let dataType in mocksToInject) {
    if(mocksToInject[dataType] && !mocksToInject[dataType].used) {
      NodeSpringUtil.error(clc.yellow.bold('  WARNING:'), clc.yellow('The declared mock for ' + testClass.name + '.' + mocksToInject[dataType].testClassProperty + ' is not required on ' + objectToTest.instance.constructor.name + '\n'))
    }
  }

  testClassObj[objectToTest.testClassProperty] = objectToTest.instance

  let testingMethods = Object.getOwnPropertyNames(testClass.prototype)

  // Running all methods
  let beforeMethods = testingMethods.filter((method) => {return testClassObj[method].beforeMethod === true})
  let testMethods = testingMethods.filter((method) => {return testClassObj[method].testMethod === true})
  let promises = []
  let methodStatus = {
    success: [],
    failed: []
  }
  let passedSymbol = process.platform === 'win32' ? 'OK' : '✔'
  let failedSymbol = process.platform === 'win32' ? 'FAIL' : '✘'

  let tick = new t.Tick(className)
  tick.start()

  testMethods.forEach((method) => {
    beforeMethods.forEach((beforeMethod) => {
      testClassObj[beforeMethod]()
    })

    let promise = new Promise((resolve, reject) => {

      let assertInstance = {}
      Object.assign(assertInstance, assert)

      assertInstance.done = () => {
        if(assertInstance.ok.lastStack) {

          NodeSpringUtil.log(clc.red('  ' + clc.red.bold(failedSymbol), method))
          NodeSpringUtil.log(clc.red('   ', assertInstance.ok.lastStack), '\n')

          methodStatus.failed.push(method)
          resolve()
          assertInstance.ok.lastStack = null
        } else {
          NodeSpringUtil.log(clc.green('  ' + clc.green.bold(passedSymbol), method), '\n')

          methodStatus.success.push(method)
          resolve()
        }
      }

      // Execute real method
      try {
        testClassObj[method](assertInstance)
      } catch(err) {
        NodeSpringUtil.log(clc.red('  ' + clc.red.bold(failedSymbol), method))
        NodeSpringUtil.log(clc.red('   ', err), '\n')

        methodStatus.failed.push(method)
        resolve()
      }
    })

    promises.push(promise)
  })

  Promise.all(promises).then((values) => {
    tick.stop()

    let timeStr = t.timers[className].parse(t.timers[className].duration())

    if(methodStatus.failed.length > 0)
      NodeSpringUtil.log(' ', clc.red(methodStatus.failed.length, 'of', testMethods.length, 'tests failed for ' + clc.red.bold(className)))
    else
      NodeSpringUtil.log(' ', clc.blue('All tests for ' + clc.blue.bold(className) + ' have passed!'))

    NodeSpringUtil.log(clc.blue.bold('  Time:'), clc.yellow(timeStr), '\n')
  })
}


export function Mock(type) {
  if(!type || !NodeSpringUtil.isClass(type)) {
    throw new NodeSpringException('@Mock expects an Interface but an ' + type + ' was received.', this, 2)
  }

  if(type.moduleType !== 'interface' && type.moduleType !== 'service') {
    throw new NodeSpringException('Mock expects an Interface or a Service as a parameter, instead ' + (type.name ? type.name : 'unknown') + ' was received', this, 2)
  }

  return (target, property, descriptor) => {
    let interfaceMethods = Object.getOwnPropertyNames(type.prototype)
    let mockInstance = {}

    interfaceMethods.forEach((method) => {
      mockInstance[method] = () => {}
    })

    descriptor.writable = true

    mocksToInject[type.packagePath] = {
      testClassProperty: property,
      used: false,
      instance: mockInstance
    }
  }
}


export function Test(target, property, descriptor) {
  if(typeof target[property] !== 'function') {
    throw new NodeSpringException('@Test expects a method but an ' + descriptor.value + ' was received.', this, 2)
  }

  descriptor.value.testMethod = true
}


export function Before(target, property, descriptor) {
  if(typeof target[property] !== 'function') {
    throw new NodeSpringException('@Before expects a method but an ' + descriptor.value + ' was received.', this, 2)
  }

  descriptor.value.beforeMethod = true
}


export function InjectMocks(type) {
  if(!type || !NodeSpringUtil.isClass(type)) {
    throw new NodeSpringException('@InjectMocks expects an Implementation but an ' + type + ' was received.', this, 2)
  }

  return (target, property, descriptor) => {
    descriptor.writable = true

    let metaInstance
    let instance

    switch(type.moduleType) {

      case 'implementation' :
        metaInstance = ModuleContainer.getModuleContainer()[type.interfacePackagePath]
        instance = metaInstance.impl
      break

      case 'service' :
        metaInstance = ModuleContainer.getModuleContainer()[type.packagePath]
        instance = metaInstance.impl
      break

      case 'controller' :
        metaInstance = ModuleContainer.getModuleContainer()[type.packagePath]
        instance = metaInstance.impl
      break
    }

    objectToTest = {
      type: type,
      testClassProperty: property,
      instance: instance,
      dependencies: metaInstance.dependencies
    }
  }
}