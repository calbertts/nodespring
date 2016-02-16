import {ModuleContainer} from '../core/moduleContainer'

var injectMocksCllbk
var localMocksInjectedCllbk
var mocksToInject = {}


export function TestClass(testClass) {
  let testClassObj = new testClass()
  injectMocksCllbk(testClassObj)
  localMocksInjectedCllbk(testClassObj)

  console.log(testClassObj)

  console.log(testClassObj.test1())
}


export function Mock(type) {
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


export function Test() {
  return (target) => {
    console.log('Inside ', target.name)
  }
}


export function InjectMocks(type) {
  return (target, property, descriptor) => {
    descriptor.writable = true

    let metaInstance = ModuleContainer.getModuleContainer()[type.interfaceName]
    let objToTest = metaInstance.impl

    for(let classProp in metaInstance.dependencies) {
      let dataType = metaInstance.dependencies[classProp]
      objToTest[classProp] = mocksToInject[dataType]
    }

    injectMocksCllbk = (testClassObj) => {
      testClassObj[property] = objToTest
      console.log('objToTest', objToTest)
    }
  }
}