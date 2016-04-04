import TestUtil from './../TestUtil.js'
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

  @Interface
  class SubType {
    subMethod1(subParam) {}
  }

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

  TestUtil.getModuleContainer()['/scenarios/SuperType1'].getInstance().then((superType1Instance) => {
    if(superType1Instance.subTypeVar && superType1Instance.subTypeVar instanceof SubTypeImpl){
      done()
    } else {
      fail("Dependency type doesn't correspond with the expected one")
    }
  })
})