# Controllers

A Controller is a Javascript class where you define the end-points you have in your API. Controllers has the purpose of handling the HTTP/Socket requests and call the service layer.


<br/>


#### How to create them
```bash
$ nodespring create:controller MyController
```

<br/>

#### @Controller

This decorator expects a class as a Controller

```javascript
import {Controller} from 'nodespring'

@Controller
export default class MyController {

  // Methods to handle the HTTP/Socket requests
}
```

When you create a Controller, an URL is automatically created: http://localhost:5000/MyController

If you want to change the name used in the URL, you can do:

```javascript
@Controller({path: 'users'})
export default class MyController {
  ...
}
```
Now we can access this controller in this way: http://localhost:5000/users

<br/>

When you go to some of those URLs above, you aren't going to get nothing unless you have an `index` method where you define what you want to send or render as a response:

```javascript
@Controller({path: 'users'})
export default class MyController {
  
  index() {
    this.index.response.render('index.html')
  }
}
```

