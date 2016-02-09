/**
 *
 * Example class
 * @author calbertts
 *
 */

import {Controller} from '../nodespring/decorators/controller'
import {Get, Post} from '../nodespring/decorators/httpMethods'


@Controller({path: 'users'})
export default class UsersController {

  anotherMethod() {
    return "message two"
  }

  @Get({contentType: 'application/json'})
  other(user) {
    return {
      message: this.anotherMethod()
    }
  }

  @Get
  test(user) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('response from UserControll:test')
      }, 1000)
    })
  }
}