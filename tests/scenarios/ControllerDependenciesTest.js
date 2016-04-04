import TestUtil from './../TestUtil.js'
import assert from '../../src/core/assert'
import {Interface, Implements, Inject, PostInject} from '../../src/decorators/dependencyManagement'
import {Service} from '../../src/decorators/service'
import {Controller} from '../../src/decorators/controller'


TestUtil.setup()

/**
 * Test the Controller dependencies
 *
 * MyService | -> SuperType | -> SubType  | -> SubType2
 *                          | -> SubType2
 *
 */
TestUtil.run(function ControllerDependencies(done, fail) {

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
   * Service
   */
  @Service
  class MyService {

    @Inject(SubType2)
    subType2ServiceVar
  }


  /**
   * Controller
   */
  @Controller
  class MyController {

    @Inject(SuperType)
    superTypeVar

    @Inject(MyService)
    myServiceVar
  }


  TestUtil.getModuleContainer()['/scenarios/MyController'].getInstance().then((myControllerInstance) => {
    if(myControllerInstance.superTypeVar instanceof SuperTypeImpl &&
      myControllerInstance.superTypeVar.subTypeVar instanceof SubTypeImpl &&
      myControllerInstance.superTypeVar.subTypeVar.subType2Var instanceof SubType2Impl &&
      myControllerInstance.superTypeVar.anotherSubType2Var instanceof SubType2Impl &&

      myControllerInstance.myServiceVar instanceof MyService &&
      myControllerInstance.myServiceVar.subType2ServiceVar instanceof SubType2Impl
    ) {
      done()
    } else {
      fail("Dependency type doesn't correspond with the expected one")
    }
  })
})