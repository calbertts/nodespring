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
  SuperType.packagePath = 'path/SuperType'

  @Interface
  class SubType {
    subMethod1(subParam) {}
  }
  SubType.packagePath = 'path/SubType'

  @Interface
  class SubType2 {
    subMethod1(subParam) {}
  }
  SubType2.packagePath = 'path/SubType2'


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
      console.log('OKKK')

      assert.notEqual(this.subTypeVar, null)
      assert.notEqual(this.anotherSubType2Var, null)

      fail("K")
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