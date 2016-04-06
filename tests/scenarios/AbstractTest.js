import TestUtil from './../TestUtil.js'
import Abstract from '../../src/core/Abstract'

TestUtil.setup()


TestUtil.expectError(function AbstractTest(done, fail) {

  class AbstractClass extends Abstract {}
  new AbstractClass()

}, 'Cannot construct AbstractClass instances directly')
