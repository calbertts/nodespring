/**
 *
 * Example class
 * @author calbertts
 *
 */

import {Controller} from '../nodespring/decorators/modules'
import {Get, Post} from '../nodespring/decorators/httpMethods'

import SuperType from '../app/interfaces/SuperType'
import TestType from './interfaces/TestType'
import {Inject} from '../nodespring/decorators/dependencyManagement'


@Controller //({path: 'users'})
export default class UsersController {

  @Inject(TestType)
  testType;

  @Inject(SuperType)
  superType;

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
        resolve('response from UserControll:test:' + this.superType.methodTwo()) + " => " + this.testType.uniqueMethod()
      }, 1000)
    })
  }
}