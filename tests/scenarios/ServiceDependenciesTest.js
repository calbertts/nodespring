import TestUtil from './../TestUtil.js'
import assert from '../../src/core/assert'
import {Interface, Implements, Inject} from '../../src/decorators/dependencyManagement'
import {Service} from '../../src/decorators/service'


TestUtil.setup()

/**
 * Test the Service dependencies
 *
 * MyService | -> SuperType | -> SubType  | -> SubType2
 *                          | -> SubType2
 *
 */
TestUtil.run(function ServiceDependencies(done, fail) {

  /**
   * Interfaces
   */
  @Interface
  class SuperType {
    method1(param) {}
  }

  @Interface
  class SubType {
    subMethod1(subParam) {}
  }

  @Interface
  class SubType2 {
    subMethod1(subParam) {}
  }


  /**
   * Implementations
   */
  @Implements(SuperType)
  class SuperTypeImpl {

    @Inject(SubType)
    subTypeVar

    @Inject(SubType2)
    anotherSubType2Var

    method1(param) {}
  }

  @Implements(SubType)
  class SubTypeImpl {

    @Inject(SubType2)
    subType2Var

    subMethod1(subParam) {}
    otherMethod() {}
  }

  @Implements(SubType2)
  class SubType2Impl {
    subMethod1(subParam) {}
  }


  /**
   * Services
   */
  @Service
  class InnerService {

    @Inject(SubType2)
    subTypeVar2Inner
  }


  @Service
  class MyService {

    @Inject(SuperType)
    superTypeVar

    @Inject(InnerService)
    innerService
  }

  TestUtil.getModuleContainer()['/scenarios/MyService'].getInstance().then((myServiceInstance) => {
    if(myServiceInstance.superTypeVar instanceof SuperTypeImpl &&
      myServiceInstance.superTypeVar.subTypeVar instanceof SubTypeImpl &&
      myServiceInstance.superTypeVar.subTypeVar.subType2Var instanceof SubType2Impl &&
      myServiceInstance.superTypeVar.anotherSubType2Var instanceof SubType2Impl &&

      myServiceInstance.innerService instanceof InnerService &&
      myServiceInstance.innerService.subTypeVar2Inner instanceof SubType2Impl
    ) {
      done()
    } else {
      fail("Dependency type doesn't correspond with the expected one")
    }
  })
})