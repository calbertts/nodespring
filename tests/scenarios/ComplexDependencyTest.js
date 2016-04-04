import TestUtil from './../TestUtil.js'
import {Interface, Implements, Inject} from '../../src/decorators/dependencyManagement'


TestUtil.setup()

/**
 * Test a complex dependency injection
 *
 * SuperType | -> SubType  | -> SubType2
 *           | -> SubType2
 *
 */
TestUtil.run(function ComplexDependency(done, fail) {

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
  }

  @Implements(SubType2)
  class SubType2Impl {
    subMethod1(subParam) {}
  }

  /**
   * Checking
   */
  Promise.all([
    TestUtil.getModuleContainer()['/scenarios/SuperType'].getInstance(),
    TestUtil.getModuleContainer()['/scenarios/SubType'].getInstance()]
  ).then((instances) => {
    let superTypeInstance = instances[0]
    let subTypeInstance = instances[1]

    if(superTypeInstance.subTypeVar && superTypeInstance.subTypeVar instanceof SubTypeImpl &&
      superTypeInstance.anotherSubType2Var && superTypeInstance.anotherSubType2Var instanceof SubType2Impl &&
      subTypeInstance.subType2Var && subTypeInstance.subType2Var instanceof SubType2Impl) {
      done()
    } else {
      fail("Dependency type doesn't correspond with the expected one")
    }
  })
})