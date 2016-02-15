import {ModuleContainer} from '../core/moduleContainer'

let isClass = (arg) => {
  return arg && arg.constructor === Function
}

export function Controller() {

  let args = arguments[0]

  //console.log('analizing controller', args.name)

  let options = {}

  let addModule = (target) => {
    //console.log('executing controller', args.name, ' for ', target.name)
    ModuleContainer.addController(target, options.path || target.name)
  }

  if(arguments.length === 0 || (arguments.length === 1 && !isClass(arguments[0]))) {
    options = arguments[0] || {}
    return addModule
  } else {
    let target = arguments[0]

    addModule(target)
  }
}
