/**
 *
 * Example class
 * @author calbertts
 *
 */

import controller from '../nodespring/annotations/controller'
import {get, post} from '../nodespring/annotations/httpMethods'


@controller
export class MyClass {

  @post({contentType: 'application/json'})
  anotherMethod() {
    return {ok: "no"}
  }

  @get
  getNewsById(id, name) {
    console.log('Values => ', id, name)
    return "I got it: " + JSON.stringify(this.anotherMethod())
  }
}