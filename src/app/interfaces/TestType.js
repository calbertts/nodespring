/**
 * TestType
 */

import {Interface} from '../../nodespring/decorators/dependencyManagement'


@Interface
export default class TestType {

  uniqueMethod() {
    return {
      params: {
        id: Number
      },
      returnValue: String
    }
  }
}