/**
 * Service decorator
 * @author calbertts
 */

import ModuleContainer from '../core/ModuleContainer'
import NodeSpringUtil from '../core/NodeSpringUtil'


export function Service(serviceClass) {
  let packagePath = NodeSpringUtil.getStack().replace(ModuleContainer.appDir, '').replace('.js', '')

  serviceClass.packagePath = packagePath
  serviceClass.moduleType = 'service'

  ModuleContainer.addService(serviceClass)
}
