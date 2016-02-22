import clc from 'cli-color'
import t from 'exectimer'
import assert from '../core/assert'

import {ModuleContainer} from '../core/moduleContainer'

var injectMocksCllbk
var localMocksInjectedCllbk
var mocksToInject = {}

let isClass = (arg) => {
  return arg && arg.constructor === Function
}

export function TestClass(testClass) {
  if(!isClass(testClass))
    throw new TypeError('A class was expected to test')

  let testClassObj = new testClass()

  injectMocksCllbk(testClassObj)
  localMocksInjectedCllbk(testClassObj)

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

  console.log(clc.blue('NodeSpring Unit Test Runner:', clc.yellow(className, '\n')))

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

          console.log(clc.red('  ✘', method))
          console.log(clc.red('   ', assertInstance.ok.lastStack), '\n')

          methodStatus.failed.push(method)
          resolve()
          assertInstance.ok.lastStack = null
        } else {
          console.log(clc.green('  ✔', method), '\n')

          methodStatus.success.push(method)
          resolve()
        }
      }

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

    console.log(clc.blue('  Time:'), clc.yellow(timeStr), '\n')
  })
}


export function Mock(type) {
  if(!type.moduleType === 'interface')
    throw new TypeError('Mock expects an Interface as a parameter, instead ' + type.name + ' was received')

  return (target, property, descriptor) => {
    let mockInstance = {
      uniqueMethod: () => {
        return "String from mock"
      }
    }

    descriptor.writable = true
    mocksToInject[type.name] = mockInstance

    localMocksInjectedCllbk = (testClassObj) => {
      testClassObj[property] = mockInstance
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
    let objToTest

    switch(type.moduleType) {

      case 'implementation' :
        metaInstance = ModuleContainer.getModuleContainer()[type.interfaceName]
        objToTest = new metaInstance.impl()
      break

      case 'service' :
        metaInstance = ModuleContainer.getModuleContainer()[type.name]
        objToTest = metaInstance.impl
      break

      case 'controller' :
        throw new TypeError('Testing for Controllers are not supported yet')
      break
    }

    for(let classProp in metaInstance.dependencies) {
      let dataType = metaInstance.dependencies[classProp]
      objToTest[classProp] = mocksToInject[dataType]
    }

    injectMocksCllbk = (testClassObj) => {
      testClassObj[property] = objToTest
    }
  }
}