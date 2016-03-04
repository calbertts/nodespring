/**
 * Decorators for HTTP Methods
 * @author calbertts
 */

import ModuleContainer from '../core/moduleContainer'
import NodeSpringUtil from '../core/NodeSpringUtil'


export function Get() {

  let packagePath = NodeSpringUtil.getStack().replace(ModuleContainer.appDir, '').replace('.js', '')
  let options = {
    contentType: 'text/html'
  }

  let addRoute = (target, property, descriptor) => {
    target.packagePath = packagePath
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
  }
}

export function Post() {

  let packagePath = NodeSpringUtil.getStack().replace(ModuleContainer.appDir, '').replace('.js', '')
  let options = {
    contentType: 'text/html'
  }

  let addRoute = (target, property, descriptor) => {
    target.packagePath = packagePath
    ModuleContainer.addRoute(target, property, 'post', options.contentType)
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
  }
}