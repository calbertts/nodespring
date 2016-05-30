# HTTP Methods

Following, the decorators used to handle the common HTTP methods, they expect a method to be used as end-point and can be used only in a Controller class.

```javascript
import {Controller, Post, Get} from 'nodespring'

@Controller
export default class MyController {

  @Get
  getMessage() {
    return "Message from MyController"
  }

  @Post
  getGreet(name) {
    return "Hi " + name
  }
}```