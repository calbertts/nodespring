/**
 *
 * Example class
 * @author calbertts
 *
 */

import Controller from '../nodespring/annotations/controller'
import Get from '../nodespring/annotations/get'


@Controller
export class MyClass {

  anotherMethod() {
    return "message"
  }

  @Get
  getNewsById(id) {
    return "I got it: " + this.anotherMethod()
  }
}