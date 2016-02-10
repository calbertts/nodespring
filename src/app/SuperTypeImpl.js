import {Implements} from '../nodespring/decorators/dependencyManagement'
import SuperType from '../app/interfaces/SuperType'


@Implements(SuperType)
export default class SuperTypeImpl {

  methodOne(id, isOK) {
    return 'value from INJECTED MODULE!!!'
  }

  methodTwo(name, type) {
    return ['one', 'two']
  }
}