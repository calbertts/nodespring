/**
 *
 * Example class
 * @author calbertts
 *
 */

import controller from '../nodespring/annotations/controller'
import {get, post} from '../nodespring/annotations/httpMethods'


@controller({path: 'users'})
export class UsersController {

  anotherMethod() {
    return "message two"
  }

  @get({contentType: 'application/json'})
  other(user) {
    return {
      message: this.anotherMethod()
    }
  }

  @get
  test(user) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('response from UserControll:test')
      }, 1000)
    })
  }
}