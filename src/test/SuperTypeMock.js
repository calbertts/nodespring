import {Implements} from '../nodespring/decorators/dependencyManagement'
import SuperType from '../app/interfaces/SuperType'


@Implements(SuperType)
export default class SuperTypeMock {

  methodOne(id, isOK) {
    return 'fake'
  }

  methodTwo(name, type) {
    return []
  }
}