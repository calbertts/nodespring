import {Implements, Inject} from '../nodespring/decorators/dependencyManagement'
import SuperType from '../app/interfaces/SuperType'
import TestType from '../app/interfaces/TestType'


@Implements(SuperType)
export default class SuperTypeImpl {

  @Inject(TestType)
  myOwnType;

  methodOne(id, isOK) {
    return 'value from INJECTED MODULE!!!'
  }

  methodTwo(name, type) {
    return "Sending something => " + this.myOwnType.uniqueMethod()
  }
}