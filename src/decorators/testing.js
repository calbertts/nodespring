/**
 * Testing decorators
 * @author calbertts
 */

import clc from 'cli-color'
import t from 'exectimer'
import path from 'path'
import assert from '../core/assert'

import ModuleContainer from '../core/moduleContainer'
import NodeSpringUtil from '../core/nodeSpringUtil'


let objectToTest = null
let mocksToInject = {}


export function TestClass(testClass) {
  if(!NodeSpringUtil.isClass(testClass))
    throw new TypeError('A class was expected to test')

  console.log(clc.blue.bold('NodeSpring Unit Test Runner:', clc.yellow(className, '\n')))

  let testClassObj = new testClass()

  // Inject mocks into the object to test
  for(let classProp in objectToTest.dependencies) {
    let dataType = objectToTest.dependencies[classProp]

    if(!mocksToInject[dataType]) {
      console.error(clc.yellow.bold('  WARNING:'), clc.yellow('There isn\'t a mock for the dependency injected in ' + objectToTest.type.name + '.' + classProp + ' (' + path.basename(dataType) + ')\n           An empty object will be provided, but tests can fail\n'))
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
      console.error(clc.yellow.bold('  WARNING:'), clc.yellow('The declared mock for ' + testClass.name + '.' + mocksToInject[dataType].testClassProperty + ' is not required on ' + objectToTest.instance.constructor.name + '\n'))
    }
  }

  testClassObj[objectToTest.testClassProperty] = objectToTest.instance

  let testingMethods = Object.getOwnPropertyNames(testClass.prototype)

  // Running all methods
  let className = testClassObj.constructor.name
  let beforeMethods = testingMethods.filter((method) => {return testClassObj[method].beforeMethod === true})
  let testMethods = testingMethods.filter((method) => {return testClassObj[method].testMethod === true})
  let promises = []
  let methodStatus = {
    success: [],
    failed: []
  }

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
        let passedSymbol = process.platform === 'win32' ? 'OK' : '✔'
        let failedSymbol = process.platform === 'win32' ? 'FAIL' : '✘'

        if(assertInstance.ok.lastStack) {

          console.log(clc.red('  ' + clc.red.bold(failedSymbol), method))
          console.log(clc.red('   ', assertInstance.ok.lastStack), '\n')

          methodStatus.failed.push(method)
          resolve()
          assertInstance.ok.lastStack = null
        } else {
          console.log(clc.green('  ' + clc.green.bold(passedSymbol), method), '\n')

          methodStatus.success.push(method)
          resolve()
        }
      }

      // Execute real method
      testClassObj[method](assertInstance)
    })

    promises.push(promise)
  })

  Promise.all(promises).then((values) => {
    tick.stop()

    let timeStr = t.timers[className].parse(t.timers[className].duration())

    if(methodStatus.failed.length > 0)
      console.log(' ', clc.red(methodStatus.failed.length, 'of', testMethods.length, 'tests failed'))
    else
      console.log(' ', clc.blue('All tests have passed!'))

    console.log(clc.blue.bold('  Time:'), clc.yellow(timeStr), '\n')
  })
}


export function Mock(type) {
  if(type.moduleType !== 'interface' && type.moduleType !== 'service')
    throw new TypeError('Mock expects an Interface or a Service as a parameter, instead ' + (type.name ? type.name : 'unknown') + ' was received')

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
  if(typeof target[property] !== 'function')
    throw new TypeError('A function was expected to test: ' + property)

  descriptor.value.testMethod = true
}


export function Before(target, property, descriptor) {
  if(typeof target[property] !== 'function')
    throw new TypeError('A function was expected to test: ' + property)

  descriptor.value.beforeMethod = true
}


export function InjectMocks(type) {
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