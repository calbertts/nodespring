import TestUtil from './../TestUtil.js'
import assert from '../../src/core/assert'
import {Interface, Implements, Inject, PostInject} from '../../src/decorators/dependencyManagement'


TestUtil.setup({
  timeout: 1
})

/**
 * Test the PostInject method
 *
 * SuperType | -> SubType  | -> SubType2
 *           | -> SubType2
 *
 */
TestUtil.run(function PostInjectMethod(done, fail) {

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

    @PostInject
    allDependenciesInjected() {

      /*Promise.all([
        TestUtil.getModuleContainer()['/scenarios/SuperType'].getInstance(),
        TestUtil.getModuleContainer()['/scenarios/SubType'].getInstance(),
        TestUtil.getModuleContainer()['/scenarios/SubType2'].getInstance()]
      ).then((instances) => {
        console.log('instances=', instances)
      })*/

      if(this.subTypeVar instanceof SubTypeImpl &&
         this.subTypeVar.subType2Var instanceof SubType2Impl &&
         this.anotherSubType2Var instanceof SubType2Impl
      ) {
        done()
      } else {
        fail("Dependency type doesn't correspond with the expected one")
      }
    }

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
})