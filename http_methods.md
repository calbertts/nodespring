# HTTP Methods

You can also handle the HTTP methods with decorators in this way:

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