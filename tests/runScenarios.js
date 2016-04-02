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