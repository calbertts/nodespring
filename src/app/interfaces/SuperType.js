/**
 *
 */

import {Interface} from '../../nodespring/decorators/dependencyManagement'


@Interface
export default class SuperType {

  methodOne() {
    return {
      params: {
        id: Number,
        isOK: Boolean
      },
      returnValue: String
    }
  }

  methodTwo() {
    return {
      params: {
        name: String,
        type: Object
      },
      returnValue: Array
    }
  }
}