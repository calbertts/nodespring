import {ModuleContainer} from '../core/moduleContainer'


export function Service(target) {
  ModuleContainer.addService(target)
}
