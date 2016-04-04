/**
 * Created by calbertts on 2/04/16.
 */

import ModuleContainer from '../src/core/ModuleContainer'
import NodeSpringUtil from '../src/core/NodeSpringUtil'
import clc from 'cli-color'
import fs from 'fs'
import path from 'path'
const spawn = require('child_process').spawn;


const passedSymbol = process.platform === 'win32' ? 'OK' : '✔'
const failedSymbol = process.platform === 'win32' ? 'FAIL' : '✘'

export default class TestUtil {

  static timeout = 5000

  static setup(options) {
    // Global configurations
    if(!global.NodeSpringConfig) {
      global.NodeSpringConfig = {}
    }

    global.NodeSpringConfig.printExceptions = false

    // App configurations
    let implConfig = {
      '/testArtifacts/thirdScenario/interface': '/scenarios/thirdScenario/InterfaceOneImpl2'
    }
    ModuleContainer.init(__dirname, null, implConfig)
    NodeSpringUtil.logging = true
    NodeSpringUtil.debugging = true

    if(options) {
      if (options.description)
        console.log(clc.blue.bold(options.description))
      if (options.timeout)
        TestUtil.timeout = options.timeout
    }
  }

  static fail(msg, err, methodName) {
    console.log(
      clc.red(clc.red.bold('  ' + failedSymbol + ' ' + methodName + ' failed: ') + msg + (err ? clc.red.bold('\n    Message: ') + err.message + clc.red.bold('\n    Details: ') + err.stack : '')))
  }

  static done(methodName) {
    console.log(clc.blue('  ' + passedSymbol + ' ' + methodName + ' passed!'))
  }

  static run(method) {

    let timeoutHandler = setTimeout(() => TestUtil.fail("Timeout, this test wasn't finished after " + TestUtil.timeout + 'ms', null, method.name), TestUtil.timeout)

    try {
      method(
        () => {
          clearTimeout(timeoutHandler)
          TestUtil.done(method.name)
        },
        (msg) => {
          clearTimeout(timeoutHandler)
          TestUtil.fail(msg, null, method.name)
        }
      )
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

  static runScenarios() {
    console.log(clc.blue.bold('Running Testing Scenarios for NodeSpring\n'))

    let testPath = __dirname + '/scenarios'
    let files = fs.readdirSync(testPath)
    let testProcesses = []

    files.forEach((file) => {
      testProcesses.push(TestUtil.runScenario(file))
    })

    Promise.all(testProcesses).then((codes) => {
      console.log(clc.green.bold('All tests have finished!\n'))
    })
  }

  static runScenario(file) {
    let testPath = __dirname + '/scenarios'
    let testFile = path.join(testPath, file)
    let ls = spawn('./node_modules/babel-cli/bin/babel-node.js', [testFile])

    ls.stdout.on('data', (data) => {
      console.log(data.toString())
    })

    ls.stderr.on('data', (data) => {
      console.log(data.toString())
    })

    return new Promise((resolve, reject) => {
      ls.on('close', (code) => {
        resolve(code)
      })
    })
  }
}

if(process.argv[2] === 'runScenarios') {
  if(process.argv[3])
    TestUtil.runScenario(process.argv[3]).then((code) => {
      console.log(clc.green.bold('The test has finished!\n'))
    })
  else
    TestUtil.runScenarios()
}
