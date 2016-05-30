# HTTP Methods

It's to possible handle all kind of 

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