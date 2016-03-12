import ModuleContainer from '../src/core/ModuleContainer'
import NodeSpringUtil from '../src/core/NodeSpringUtil'
import NodeSpringException from '../src/exceptions/NodeSpringException'
import clc from 'cli-color'
import assert from '../src/core/assert'

// NodeSpring decorators
import {Interface, Implements, Inject, PostInject} from '../src/decorators/dependencyManagement'
import {Mock, TestClass, Test, Before, InjectMocks} from '../src/decorators/testing'


(function setup() {

  // Global configurations
  if(!global.NodeSpringConfig) {
    global.NodeSpringConfig = {}
  }

  global.NodeSpringConfig.printExceptions = false

  // App configurations
  let implConfig = {
    '/testArtifacts/thirdScenario/interface': '/testArtifacts/thirdScenario/InterfaceOneImpl2'
  }
  ModuleContainer.init(__dirname, {}, implConfig)
  NodeSpringUtil.logging = true
  NodeSpringUtil.debugging = false

  NodeSpringUtil.log(clc.blue.bold('Running Testing Scenarios for NodeSpring\n'))
})();


(function runScenario0() {
  let fail = (err, msg) => NodeSpringUtil.log(clc.red('  Scenario 0 failed: ' + msg + (err ? '\n  Message: ' + err.message : '') + '\n'))

  try {
    class TestInject {
      @Inject(undefined)
      variable
    }
  } catch(err) {
    if(err.message.match(/@Inject expects an Interface but an .* was received./)) {
      NodeSpringUtil.log(clc.blue('  Scenario 0.1 passed!\n'))
    } else {
      fail(err, "Expected exception when the Interface passed to @Inject(...) is not valid")
    }
  }

  try {
    @Implements(undefined)
    class TestImplements {

    }
  } catch(err) {
    if(err.message.match(/@Implements expects a Class but an .* was received./)) {
      NodeSpringUtil.log(clc.blue('  Scenario 0.2 passed!\n'))
    } else {
      fail(err, "Expected exception when the Class decorated with @Implements(...) is not valid")
    }
  }

  try {
    @Interface(undefined)
    class TestImplements {

    }
  } catch(err) {
    if(err.message.match(/@Interface expects a Class but an .* was received./)) {
      NodeSpringUtil.log(clc.blue('  Scenario 0.3 passed!\n'))
    } else {
      fail(err, "Expected exception when the Class decorated with @Interface(...) is not valid")
    }
  }

  try {
    @TestClass(undefined)
    class TestTestClass {

    }
  } catch(err) {
    if(err.message.match(/@TestClass expects a Class but an .* was received./)) {
      NodeSpringUtil.log(clc.blue('  Scenario 0.4 passed!\n'))
    } else {
      fail(err, "Expected exception when the Class decorated with @TestClass(...) is not valid")
    }
  }

  try {
    class TestMock {
      @Mock(undefined)
      mock
    }
  } catch(err) {
    if(err.message.match(/@Mock expects an Interface but an .* was received./)) {
      NodeSpringUtil.log(clc.blue('  Scenario 0.5 passed!\n'))
    } else {
      fail(err, "Expected exception when the Interface passed to @Mock(...) is not valid")
    }
  }

  try {
    class TestInjectMocks {
      @InjectMocks(undefined)
      mock
    }
  } catch(err) {
    if(err.message.match(/@InjectMocks expects an Implementation but an .* was received./)) {
      NodeSpringUtil.log(clc.blue('  Scenario 0.6 passed!\n'))
    } else {
      fail(err, "Expected exception when the Implementation passed to @InjectMocks(...) is not valid")
    }
  }

  try {
    class TestTestMethod {

      @Test
      test1() {}
    }
  } catch(err) {
    if(err.message.match(/@Test expects a method but an .* was received./)) {
      NodeSpringUtil.log(clc.blue('  Scenario 0.7 passed!\n'))
    } else {
      fail(err, "Expected exception when the method decorated with @Test(...) is not valid")
    }
  }

  try {
    class TestBeforeMethod {

      @Before
      test1() {}
    }
  } catch(err) {
    if(err.message.match(/@Before expects a method but an .* was received./)) {
      NodeSpringUtil.log(clc.blue('  Scenario 0.7 passed!\n'))
    } else {
      fail(err, "Expected exception when the method decorated with @Before(...) is not valid")
    }
  }
})();

(() => ModuleContainer.clearModuleContainer())();

(function runScenario1() {
  let fail = (err, msg) => NodeSpringUtil.log(clc.red('  Scenario 1 failed: ' + msg + (err ? '\n  Message: ' + err.message : '') + '\n'))

  try {
    @Interface
    class SuperType {
      method1(param) {}
    }

    @Implements(SuperType)
    class SuperTypeImpl {}

    fail(null, "An exception was expected")
  } catch(err) {
    if(err.message.match(/The method ".*" declared in .* is not implemented in .*/)) {
      NodeSpringUtil.log(clc.blue('  Scenario 1 passed!\n'))
    } else {
      fail(err, "Expected exception when a parameter isn't present wasn't thrown")
    }
  }
})();

(() => ModuleContainer.clearModuleContainer())();

(function runScenario2() {
  let fail = (err, msg) => NodeSpringUtil.log(clc.red('  Scenario 2 failed: ' + msg + (err ? '\n  Message: ' + err.message : '') + '\n'))

  try {
    @Interface
    class SuperType {
      method1(param) {}
    }

    @Implements(SuperType)
    class SuperTypeImpl {
      method1() {}
    }

    fail(null, "An exception was expected")
  } catch(err) {
    if(err.message.match(/The param ".*" declared in .* is not present in .*/)) {
      NodeSpringUtil.log(clc.blue('  Scenario 2 passed!\n'))
    } else {
      fail(err, "Expected exception when a parameter isn't present wasn't thrown")
    }
  }
})();

(() => ModuleContainer.clearModuleContainer())();

(function runScenario3() {
  let fail = (err, msg) => NodeSpringUtil.log(clc.red('  Scenario 3 failed: ' + msg + (err ? '\n  Message: ' + err.message : '') + '\n'))

  try {
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
      let instanceToCheck = ModuleContainer.getModuleContainer()['path/SuperType1'].impl

      if(instanceToCheck.subTypeVar && instanceToCheck.subTypeVar instanceof SubTypeImpl) {
        if(!instanceToCheck.subTypeVar) {
          fail(null, "Dependency type doesn't correspond with the expected one")
        }

        NodeSpringUtil.log(clc.blue('  Scenario 3 passed!\n'))
      } else {
        fail(null, "Dependency type doesn't correspond with the expected one")
      }

      (() => ModuleContainer.clearModuleContainer())();
    }, 5000)
  } catch(err) {
    fail(err, "Unexpected exception")
  }
})();


(function runScenario4() {
  NodeSpringUtil.debug('STARTING SCENARIO 4')
  let fail = (err, msg) => NodeSpringUtil.log(clc.red('  Scenario 4 failed: ' + msg + (err ? '\n  Message: ' + err.message : '') + '\n'))

  try {
    @Interface
    class SuperTypeX {
      method1(param) {}
    }
    SuperTypeX.packagePath = 'path/SuperType'

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


    @Implements(SuperTypeX)
    class SuperTypeImpl {

      @Inject(SubType)
      subTypeVar

      method1(param) {}
    }

    @Implements(SubType2)
    class SubTypeImpl2 {
      subMethod1(subParam) {}
    }

    @Implements(SubType)
    class SubTypeImpl {

      @Inject(SubType2)
      subType2Var

      subMethod1(subParam) {}
    }

    setTimeout(() => {
      NodeSpringUtil.debug('global.modulesContainer', Object.keys(ModuleContainer.getModuleContainer()))
      let instanceToCheck = ModuleContainer.getModuleContainer()['path/SuperType'].impl

      NodeSpringUtil.debug(instanceToCheck.subTypeVar)
      if(instanceToCheck.subTypeVar instanceof SubTypeImpl)
        NodeSpringUtil.debug('instanceToCheck', instanceToCheck)

      if(instanceToCheck.subTypeVar && instanceToCheck.subTypeVar instanceof SubTypeImpl) {
        NodeSpringUtil.debug(clc.blue('  Scenario 4 passed!\n'))
      } else {
        fail(null, "Dependency type doesn't correspond with the expected one")
      }

      (() => ModuleContainer.clearModuleContainer())();
    }, 10000)
  } catch(err) {
    fail(err, "Unexpected exception")
  }
})();