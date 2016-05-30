# HTTP Methods

You can also handle the HTTP methods with decorators in this way:

```javascript
import {Controller, Post, Get, Put, Delete} from 'nodespring'

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
  
  // the same for PUT, DELETE and so on
}```

Also if you want to return a JSON or any other kind of contentType, you can do:

```javascript
@Post({contentType: 'application/json'})
getJSONObject(id, name) {
  return {
    id: id,
    userName: name
  }
}```

Each decorated method is an end-point:

http://localhost:5000/MyController/getMessage http://localhost:5000/MyController/getJSONObject 