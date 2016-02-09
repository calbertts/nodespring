/**
 * Dependency Management
 *
 * @author calbertts
 */

import {ModuleContainer} from '../core/moduleContainer'

export function Inject(typeToInject) {

  console.log('Type to inject => ', typeToInject)

  return (target, property, descriptor) => {
    descriptor.initializer = () => {return {ok: 1}}
    console.log('inject2', target, property, descriptor)
  }

  /*let options = {
    contentType: 'text/html'
  }

  let addRoute = (target, property, descriptor) => {
    ModuleContainer.addRoute(target, property, 'get', options.contentType)
  }

  if(arguments.length <= 1) {
    options = arguments[0] || {}
    options.contentType = !options.contentType ? 'text/html' : options.contentType

    return addRoute
  } else {
    let target = arguments[0]
    let property = arguments[1]
    let descriptor = arguments[2]

    addRoute(target, property, descriptor)
  }*/
}

export function Interface(type) {
  ModuleContainer.addInterface(type, null)
}

export function Implements(type) {
  return (target, property, descriptor) => {
    //console.log('implements2', target, property, descriptor)
    ModuleContainer.addImplementation(type, target)
  }
}