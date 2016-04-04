import TestUtil from './../TestUtil.js'
import {Interface, Implements, Inject} from '../../src/decorators/dependencyManagement'


TestUtil.setup()

/**
 * Test when a declared method wasn't implemented
 */
TestUtil.expectError(function MethodNotImplemented() {
  @Interface
  class InterfaceTest {
    methodOne() {}
  }

  @Implements(InterfaceTest)
  class InterfaceTestImpl {}
}, 'The method ".*" declared in .* is not implemented in .*')


/**
 * Test when a declared parameter ins't in the implemented method
 */
TestUtil.expectError(function ParameterNotPresent() {
  @Interface
  class InterfaceTest {
    methodOne(param) {}
  }

  @Implements(InterfaceTest)
  class InterfaceTestImpl {
    methodOne() {}
  }
}, 'The param "param" declared in .* is not present in .*')