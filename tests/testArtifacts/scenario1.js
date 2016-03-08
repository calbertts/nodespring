import {Interface, Implements} from '../../src/decorators/dependencyManagement'


@Interface
export class InterfaceOne {
  methodOne() {}
}

@Implements(InterfaceOne)
export class InterfaceOneImpl {

}