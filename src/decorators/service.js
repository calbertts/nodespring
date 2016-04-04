/**
 * Service decorator
 * @author calbertts
 */

import ModuleContainer from '../core/ModuleContainer'
import NodeSpringUtil from '../core/NodeSpringUtil'
import path from 'path'


export function Service(serviceClass) {
  let basePackagePath = path.dirname(NodeSpringUtil.getStack().replace(ModuleContainer.appDir, '').replace('.js', ''))
  let packagePath = basePackagePath + '/' + serviceClass.name

  serviceClass.packagePath = serviceClass.packagePath || packagePath
  serviceClass.moduleType = 'service'

  //console.log(NodeSpringUtil.getStack())
  ModuleContainer.addService(serviceClass)
}
