import TestUtil from './TestUtil.js'
import {Interface, Implements, Inject, PostInject} from '../../src/decorators/dependencyManagement'
import {Mock, TestClass, Test, Before, InjectMocks} from '../../src/decorators/testing'


TestUtil.setup()


/**
 * @Inject
 */
TestUtil.expectError(function InjectUndefined() {
  class TestInject {
    @Inject(undefined)
    variable
  }
}, "@Inject expects an Interface but an .* was received.")


/**
 * @Implements
 */
TestUtil.expectError(function ImplementsUndefined() {
  @Implements(undefined)
  class TestImplements {

  }
}, "@Implements expects a Class but an .* was received.")


/**
 * @Interface
 */
TestUtil.expectError(function InterfaceUndefined() {
  @Interface(undefined)
  class TestImplements {

  }
}, "@Interface expects a Class but an .* was received.")


/**
 * @TestClass
 */
TestUtil.expectError(function TestClassUndefined() {
  @TestClass(undefined)
  class TestTestClass {

  }
}, "@TestClass expects a Class but an .* was received.")


/**
 * @Mock
 */
TestUtil.expectError(function MockUndefined() {
  class TestMock {
    @Mock(undefined)
    mock
  }
}, "@Mock expects an Interface but an .* was received.")


/**
 * @InjectMocks
 */
TestUtil.expectError(function InjectMocksUndefined() {
  class TestInjectMocks {
    @InjectMocks(undefined)
    mock
  }
}, "@InjectMocks expects an Implementation but an .* was received.")


/**
 * @Test
 */
TestUtil.expectError(function TestWithoutMethod() {
  class TestTestMethod {
    @Test
    test1
  }
}, "@Test expects a method but an .* was received.")


/**
 * @Before
 */
TestUtil.expectError(function BeforeWithoutMethod() {
  class TestBeforeMethod {
    @Before
    test1
  }
}, "@Before expects a method but an .* was received.")