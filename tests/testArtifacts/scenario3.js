import TestUtil from './TestUtil.js'
import {Interface, Implements, Inject} from '../../src/decorators/dependencyManagement'


TestUtil.setup()

/**
 * Test a simple dependency injected
 */
TestUtil.run(function SimpleDependency(done, fail) {
  @Interface
  class SuperType1 {
    method1(param) {}
  }
  SuperType1.packagePath = 'path/SuperType1'

  @Interface
  class SubType {
    subMethod1(subParam) {}
  }
  SubType.packagePath = 'path/SubType'


  @Implements(SuperType1)
  class SuperTypeImpl1 {

    @Inject(SubType)
    subTypeVar

    method1(param) {}
  }

  @Implements(SubType)
  class SubTypeImpl {
    subMethod1(subParam) {}
  }

  setTimeout(() => {
    let instanceToCheck = TestUtil.getModuleContainer()['path/SuperType1'].impl

    if(instanceToCheck && instanceToCheck.subTypeVar && instanceToCheck.subTypeVar instanceof SubTypeImpl){
      done()
    } else {
      fail("Dependency type doesn't correspond with the expected one")
    }
  }, 1000)
})