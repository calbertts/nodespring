# @Service

This decorator expects a class to be used as a Service, all the services are singleton, it means, only one instance of this class is going to be created and shared through all the application. 

Each time a Service is injected, the unique instance is used, that's why all the Services must to be stateless.

```javascript
import {Service} from 'nodespring'

@Service
export default class MyService {

  // Methods to communicate with the module
}
```