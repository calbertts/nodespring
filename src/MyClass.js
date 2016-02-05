import Controller from './annotations/controller'
import Post from './annotations/post'

@Controller
export default class MyClass {

  @Post
  getNewsById(id) {
    return "I got it!"
  }
}