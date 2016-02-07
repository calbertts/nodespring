/**
 *
 * Example class
 * @author calbertts
 *
 */

import Controller from '../nodespring/annotations/controller'
import Get from '../nodespring/annotations/get'


@Controller({path: 'users'})
export class UsersController {

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
    return 'dummy'
  }
}