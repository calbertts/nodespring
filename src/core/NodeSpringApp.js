/**
 * NodeSpringApp
 * @author calbertts
 */

import ModuleContainer from './moduleContainer'
import Abstract from './Abstract'
import NodeSpringUtil from './NodeSpringUtil'
import NodeSpringException from '../exceptions/NodeSpringException'


export default class NodeSpringApp extends Abstract {

  constructor(config) {
    super()
    this.config = config

    /*if (new.target === NodeSpringApp) {
      let noInstantiable = new NodeSpringException("Cannot construct NodeSpringApp instances directly", this, 1);
      NodeSpringUtil.throwNodeSpringException(noInstantiable)
    }*/

    // Checking methods that need to be implemented
    let requiredMethods = {
      bindURL: ['method', 'url', 'callback'],
      getRequestParams: ['request', 'callback'],
      setContentTypeResponse: ['response', 'contentType'],
      sendJSONResponse: ['response', 'data'],
      sendDataResponse: ['response', 'data']
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
          if(officialParam, implementedMethodParams.indexOf(officialParam) < 0) {
            let missingParameter = new NodeSpringException('The parameter "' + officialParam + '" is not present on the implemented method "' + methodName + '(...)" in the class ' + this.__proto__.__proto__.constructor.name, undefined, 6)
            NodeSpringUtil.throwNodeSpringException(missingParameter)
          }
        })
      }
    }
  }

  start() {
    ModuleContainer.init(this)
    ModuleContainer.loadModules(this.config.classDir)
  }
}