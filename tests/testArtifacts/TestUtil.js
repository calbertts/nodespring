/**
 * Created by calbertts on 2/04/16.
 */

import ModuleContainer from '../../src/core/ModuleContainer'
import NodeSpringUtil from '../../src/core/NodeSpringUtil'
import clc from 'cli-color'

const passedSymbol = process.platform === 'win32' ? 'OK' : '✔'
const failedSymbol = process.platform === 'win32' ? 'FAIL' : '✘'

export default class TestUtil {

  static setup(options) {
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

    if(options && options.description)
      console.log(clc.blue.bold(options.description))
  }

  static fail(msg, err, methodName) {
    console.log(clc.red('  ' + failedSymbol + ' ' + methodName + ' failed: ' + msg + (err ? '\n    Message: ' + err.message : '')))
  }

  static done(methodName) {
    console.log(clc.blue('  ' + passedSymbol + ' ' + methodName + ' passed!'))
  }

  static run(method) {
    try {
      method(() => TestUtil.done(method.name), (msg) => TestUtil.fail(msg, null, method.name))
    } catch(err) {
      TestUtil.fail(err, err, method.name)
    }
  }

  static expectError(method, expr) {
    try {
      method(TestUtil.done, TestUtil.fail)
      TestUtil.fail("An exception was expected", null, method.name)
    } catch(err) {
      if(err.message.match(expr)) {
        TestUtil.done(method.name)
      } else {
        TestUtil.fail("A different exception was expected", err, method.name)
      }
    }
  }

  static getModuleContainer() {
    return ModuleContainer.getModuleContainer()
  }
}