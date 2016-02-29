/**
 * Service decorator
 * @author calbertts
 */

import ModuleContainer from '../core/moduleContainer'


export function Service(target) {
  target.moduleType = 'service'
  ModuleContainer.addService(target)
}
