import {Implements} from '../nodespring/decorators/dependencyManagement'
import TestType from '../app/interfaces/TestType'


@Implements(TestType)
export default class TestTypeImpl {

  uniqueMethod(id) {
    return 'greeting from TestType:uniqueMethod'
  }
}