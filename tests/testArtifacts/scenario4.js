import TestUtil from './TestUtil.js'
import {Interface, Implements, Inject} from '../../src/decorators/dependencyManagement'


TestUtil.setup()

/**
 * Test a two level dependency injected
 *
 * SuperType -> SubType -> SubType2
 *
 *
 */
TestUtil.run(function TwoLevelDependency(done, fail) {
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


  @Implements(SuperType)
  class SuperTypeImpl {

    @Inject(SubType)
    subTypeVar

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

  setTimeout(() => {
    let superTypeInstance = TestUtil.getModuleContainer()['path/SuperType'].impl
    let subTypeInstance = TestUtil.getModuleContainer()['path/SubType'].impl

    if(superTypeInstance.subTypeVar && superTypeInstance.subTypeVar instanceof SubTypeImpl &&
      subTypeInstance.subType2Var && subTypeInstance.subType2Var instanceof SubType2Impl) {
      done()
    } else {
      fail("Dependency type doesn't correspond with the expected one")
    }
  }, 1000)
})