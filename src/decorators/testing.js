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
  let beforeMethods = testingMethods.filter((method) => {return testClassObj[method].beforeMethod === true})
  let testMethods = testingMethods.filter((method) => {return testClassObj[method].testMethod === true})

  testMethods.forEach((method) => {
    beforeMethods.forEach((beforeMethod) => {
      testClassObj[beforeMethod]()
    })
    testClassObj[method]()
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