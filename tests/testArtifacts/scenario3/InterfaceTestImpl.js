import {Implements} from '../../../src/decorators/dependencyManagement'
import InterfaceTest from './InterfaceTest'

@Implements(InterfaceTest)
export class InterfaceOneImpl {
  methodOne() {}
}