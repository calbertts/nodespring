import ModuleContainer from '../src/core/ModuleContainer'
import NodeSpringUtil from '../src/core/NodeSpringUtil'
import NodeSpringException from '../src/exceptions/NodeSpringException'
import clc from 'cli-color'
import assert from '../src/core/assert'

// NodeSpring decorators
import {Interface, Implements, Inject, PostInject} from '../src/decorators/dependencyManagement'


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

  console.log(clc.blue.bold('Running Testing Scenarios for NodeSpring\n'))
})();



(function runScenario1() {
  global.modulesContainer = {}
  let fail = (err, msg) => console.log(clc.red('  Scenario 1 failed: ' + msg + (err ? '\n  Message: ' + err.message : '') + '\n'))

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
      console.log(clc.blue('  Scenario 1 passed!\n'))
    } else {
      fail(err, "Expected exception when a parameter isn't present wasn't thrown")
    }
  }
})();

(() => ModuleContainer.clearModuleContainer())();

(function runScenario2() {
  global.modulesContainer = {}
  let fail = (err, msg) => console.log(clc.red('  Scenario 2 failed: ' + msg + (err ? '\n  Message: ' + err.message : '') + '\n'))

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
      console.log(clc.blue('  Scenario 2 passed!\n'))
    } else {
      fail(err, "Expected exception when a parameter isn't present wasn't thrown")
    }
  }
})();

(() => ModuleContainer.clearModuleContainer())();

(function runScenario3() {
  let fail = (err, msg) => console.log(clc.red('  Scenario 3 failed: ' + msg + (err ? '\n  Message: ' + err.message : '') + '\n'))

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

        console.log(clc.blue('  Scenario 3 passed!\n'))
      } else {
        fail(null, "Dependency type doesn't correspond with the expected one")
      }
    }, 100)
  } catch(err) {
    fail(err, "Unexpected exception")
  }
})();

(() => ModuleContainer.clearModuleContainer())();

(function runScenario4() {
  console.log('STARTING SCENARIO 4')
  let fail = (err, msg) => console.log(clc.red('  Scenario 4 failed: ' + msg + (err ? '\n  Message: ' + err.message : '') + '\n'))

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
      console.log('global.modulesContainer', Object.keys(ModuleContainer.getModuleContainer()))
      let instanceToCheck = ModuleContainer.getModuleContainer()['path/SuperType'].impl

      console.log(instanceToCheck.subTypeVar)
      if(instanceToCheck.subTypeVar instanceof SubTypeImpl)
        console.error('instanceToCheck', instanceToCheck)

      if(instanceToCheck.subTypeVar && instanceToCheck.subTypeVar instanceof SubTypeImpl) {
        console.log(clc.blue('  Scenario 4 passed!\n'))
      } else {
        fail(null, "Dependency type doesn't correspond with the expected one")
      }
    }, 1)
  } catch(err) {
    fail(err, "Unexpected exception")
  }
})();