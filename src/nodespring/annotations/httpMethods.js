/**
 * HTTP Methods
 *
 * @author calbertts
 */

import {ModuleContainer} from '../core/moduleContainer'

export function get() {

  let options = {
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
  }
}

export function post() {

  let options = {
    contentType: 'text/html'
  }

  let addRoute = (target, property, descriptor) => {
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