# Controllers

A Controller is a Javascript class where you define the end-points you have in your API. Controllers are used to handle the HTTP requests and call the service layer.



---



#### How to create them
```bash
$ nodespring create:controller MyController
```


#### @Controller

This decorator expects a class to be used as a Controller

```javascript
import {Controller} from 'nodespring'

@Controller
export default class MyController {

  // Methods to handle the HTTP requests
}```

