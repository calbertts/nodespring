import {ModuleContainer} from '../core/moduleContainer'

let isClass = (arg) => {
  return arg && arg.constructor === Function
}

export function Controller() {

  let options = {}

  let addModule = (target) => {
    ModuleContainer.addModule(target, options.path || target.name)
  }

  if(arguments.length === 0 || (arguments.length === 1 && !isClass(arguments[0]))) {
    options = arguments[0] || {}
    return addModule
  } else {
    let target = arguments[0]

    addModule(target)
  }

  //var propertyNames = Object.getOwnPropertyNames(classDef.prototype);
  //console.log('CONTROLLER:', propertyNames)
}