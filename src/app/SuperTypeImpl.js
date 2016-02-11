import {Implements, Inject} from '../nodespring/decorators/dependencyManagement'
import {Component} from '../nodespring/decorators/modules'
import SuperType from '../app/interfaces/SuperType'
import TestType from '../app/interfaces/TestType'


@Component
@Implements(SuperType)
export default class SuperTypeImpl {

  @Inject(TestType)
  testType;

  methodOne(id, isOK) {
    return 'value from INJECTED MODULE!!!'
  }

  methodTwo(name, type) {
    return "Sending something => " + this.testType.uniqueMethod()
  }
}