import {Interface, Implements} from '../../src/decorators/dependencyManagement'


@Interface
export class InterfaceOne {
  methodOne(param1) {}
}

@Implements(InterfaceOne)
export class InterfaceOneImpl {
  methodOne() {}
}