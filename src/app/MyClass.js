/**
 *
 * Example class
 * @author calbertts
 *
 */

import {Controller} from '../nodespring/decorators/controller'
import {Get, Post} from '../nodespring/decorators/httpMethods'
import {Inject} from '../nodespring/decorators/dependencyManagement'

import SuperType from './interfaces/SuperType'


@Controller
export class MyClass {

  @Inject(SuperType)
  users;

  @Post({contentType: 'application/json'})
  anotherMethod() {
    return {ok: "no"}
  }

  @Get
  getNewsById(id, name) {
    console.log('injected value!!!! => ', this.users)
    console.log('Values => ', id, name)
    return "I got it: " + JSON.stringify(this.anotherMethod())
  }
}