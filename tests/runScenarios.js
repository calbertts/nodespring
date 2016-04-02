import assert from '../src/core/assert'
const spawn = require('child_process').spawn;
import clc from 'cli-color'

(function() {
  console.log(clc.blue.bold('Running Testing Scenarios for NodeSpring\n'))
})();


(function runScenario0() {
  var filename = __dirname + '/testArtifacts/scenario1.js'
  const ls = spawn('./node_modules/babel-cli/bin/babel-node.js', [filename]);

  ls.stdout.on('data', (data) => {
    console.log(data.toString())
  });

  ls.stderr.on('data', (data) => {
    console.log(data.toString())
  });

  ls.on('close', (code) => {})
})();


(function runScenario2() {
  var filename = __dirname + '/testArtifacts/scenario2.js'
  const ls = spawn('./node_modules/babel-cli/bin/babel-node.js', [filename]);

  ls.stdout.on('data', (data) => {
    console.log(data.toString())
  });

  ls.stderr.on('data', (data) => {
    console.log(data.toString())
  });

  ls.on('close', (code) => {})
})();


(function runScenario3() {
  var filename = __dirname + '/testArtifacts/scenario3.js'
  const ls = spawn('./node_modules/babel-cli/bin/babel-node.js', [filename]);

  ls.stdout.on('data', (data) => {
    console.log(data.toString())
  });

  ls.stderr.on('data', (data) => {
    console.log(data.toString())
  });

  ls.on('close', (code) => {})
})();


(function runScenario4() {
  var filename = __dirname + '/testArtifacts/scenario4.js'
  const ls = spawn('./node_modules/babel-cli/bin/babel-node.js', [filename]);

  ls.stdout.on('data', (data) => {
    console.log(data.toString())
  });

  ls.stderr.on('data', (data) => {
    console.log(data.toString())
  });

  ls.on('close', (code) => {})
})();

//
//
//(function runScenario3() {
//  let fail = (err, msg) => NodeSpringUtil.log(clc.red('  Scenario 3 failed: ' + msg + (err ? '\n  Message: ' + err.message : '') + '\n'))
//
//  try {
//    @Interface
//    class SuperType1 {
//      method1(param) {}
//    }
//    SuperType1.packagePath = 'path/SuperType1'
//
//    @Interface
//    class SubType {
//      subMethod1(subParam) {}
//    }
//    SubType.packagePath = 'path/SubType'
//
//
//    @Implements(SuperType1)
//    class SuperTypeImpl1 {
//
//      @Inject(SubType)
//      subTypeVar
//
//      method1(param) {}
//    }
//
//    @Implements(SubType)
//    class SubTypeImpl {
//      subMethod1(subParam) {}
//    }
//
//    setTimeout(() => {
//      let instanceToCheck = ModuleContainer.getModuleContainer()['path/SuperType1'].impl
//
//      if(instanceToCheck.subTypeVar && instanceToCheck.subTypeVar instanceof SubTypeImpl) {
//        if(!instanceToCheck.subTypeVar) {
//          fail(null, "Dependency type doesn't correspond with the expected one")
//        }
//
//        NodeSpringUtil.log(clc.blue('  Scenario 3 passed!\n'))
//      } else {
//        fail(null, "Dependency type doesn't correspond with the expected one")
//      }
//
//      (() => ModuleContainer.clearModuleContainer())();
//    }, 5000)
//  } catch(err) {
//    fail(err, "Unexpected exception")
//  }
//})();
//
//
//(function runScenario4() {
//  NodeSpringUtil.debug('STARTING SCENARIO 4')
//  let fail = (err, msg) => NodeSpringUtil.log(clc.red('  Scenario 4 failed: ' + msg + (err ? '\n  Message: ' + err.message : '') + '\n'))
//
//  try {
//
//  } catch(err) {
//    fail(err, "Unexpected exception")
//  }
//})();