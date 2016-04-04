/**
 * NodeSpringApp
 * @author calbertts
 */

import ModuleContainer from './ModuleContainer'
import Abstract from './Abstract'
import NodeSpringUtil from './NodeSpringUtil'
import NodeSpringException from '../exceptions/NodeSpringException'


export default class NodeSpringApp extends Abstract {

  constructor(config) {
    super()
    this.config = config

    // Global settings
    if(!global.NodeSpringConfig) {
      global.NodeSpringConfig = {}
    }

    global.NodeSpringConfig.printExceptions = true

    // Checking methods that need to be implemented
    let requiredMethods = {
      bindURL: ['method', 'url', 'callback'],
      getRequestParams: ['request', 'callback'],
      setContentTypeResponse: ['response', 'contentType'],
      sendJSONResponse: ['response', 'data'],
      sendDataResponse: ['response', 'data'],
      addSocketListeners: ['namespace', 'socketListeners', 'instance']
    }

    for(let methodName in requiredMethods) {
      if(this[methodName] === undefined) {
        let noImplementedMethod = new NodeSpringException('The method ' + methodName + ' must be implemented on ' + this.__proto__.__proto__.constructor.name)

        NodeSpringUtil.throwNodeSpringException(noImplementedMethod)
      } else {
        let methodParams = requiredMethods[methodName]

        // Check the parameters
        let implementedMethodParams = NodeSpringUtil.getArgs(this[methodName])

        methodParams.forEach((officialParam) => {
          if(implementedMethodParams.indexOf(officialParam) < 0) {
            let missingParameter = new NodeSpringException('The parameter "' + officialParam + '" is not present on the implemented method "' + methodName + '(...)" in the class ' + this.__proto__.__proto__.constructor.name, undefined, 6)
            NodeSpringUtil.throwNodeSpringException(missingParameter)
          }
        })
      }
    }
  }

  start() {
    ModuleContainer.init(this.config.classDir, this, this.config.implConfig, this.config.logging, this.config.loggingSync, this.config.debugging)
    ModuleContainer.loadModules()
  }
}