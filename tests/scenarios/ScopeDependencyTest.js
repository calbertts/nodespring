import TestUtil from './../TestUtil.js'
import assert from '../../src/core/assert'
import {Interface, Implements, Inject, Scope} from '../../src/decorators/dependencyManagement'
import {Service} from '../../src/decorators/service'


TestUtil.setup()

/**
 *
 * Test the scope dependencies
 *
 */
TestUtil.run(function ScopeDependencies(done, fail) {

  /**
   * Interfaces
   */
  @Interface
  class PrototypeInterface {}

  Interface
  class SingletonInterface {}


  /**
   * Implementations
   */
  @Implements(PrototypeInterface, Scope.PROTOTYPE)
  class PrototypeImpl {

    variable = 10

    set var(newVal) {
      this.variable = newVal
    }

    get var() {
      return this.variable
    }
  }

  @Implements(SingletonInterface, Scope.SINGLETON)
  class SingletonImpl {

    variable = 10

    set var(newVal) {
      this.variable = newVal
    }

    get var() {
      return this.variable
    }
  }


  /**
   * Services
   */
  @Service
  class ServiceOne {

    @Inject(PrototypeInterface)
    prototypeVar

    @Inject(SingletonInterface)
    singletonVar
  }

  @Service
  class ServiceTwo {

    @Inject(PrototypeInterface)
    prototypeVar

    @Inject(SingletonInterface)
    singletonVar
  }


  /**
   * Checking
   */
  Promise.all([
    TestUtil.getModuleContainer()['/scenarios/ServiceOne'].getInstance(),
    TestUtil.getModuleContainer()['/scenarios/ServiceTwo'].getInstance()]
  ).then((instances) => {
    let serviceOneInstance = instances[0]
    let serviceTwoInstance = instances[1]
    let status = true

    /**
     * Prototype test
     */
    serviceOneInstance.prototypeVar.variable = 20
    serviceOneInstance.singletonVar.variable = 20

    if(serviceOneInstance.prototypeVar.variable === serviceTwoInstance.prototypeVar.variable) {
      status = false
      fail("Different values were expected for prototypeVar")
    }

    if(serviceOneInstance.singletonVar.variable !== serviceTwoInstance.singletonVar.variable) {
      status = false
      fail('Equal values were expected for singletonVar')
    }

    if(status)
      done()
  })
})