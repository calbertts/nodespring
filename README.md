# NodeSpring

[![Join the chat at https://gitter.im/calbertts/nodespring](https://badges.gitter.im/calbertts/nodespring.svg)](https://gitter.im/calbertts/nodespring?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

NodeSpring is a framework to create NodeJS applications using common patterns used in other programming languages like Java and frameworks like Spring.

```bash
$ npm install nodespring
```


## Concepts
The concepts used by NodeSpring:

* **Controllers**
  The end points where you deal with HTTP methods (GET, POST, etc.) and invoke the service layer
  
* **Services**
  Since you have several modules in your application, it's a good practice to have a service layer where you define the way that those modules are going to communicate each other

* **Interfaces**
  An interface in *NodeSpring* is a Javascript class (ES6) where you define methods without business logic, just the definition.
  
* **Implementations**
  An implementation is a class that implements all the methods defined on the interface, here is where your business logic should be placed

* **Unit tests**
  They are Javascript classes (ES6) where you test every single method of your Service/Implementation using the mechanism provided by *NodeSpring*


## How they looks like?

*Controller*:
```javascript
import {Controller, Get, Post, Inject} from 'nodespring'
import MyUsersService from '../services/MyUsersService'


@Controller
export default class MyClass {

  @Inject(MyUsersService)
  usersService

  @Post({contentType: 'application/json'})
  saveObject(object) {
    return usersService.saveUser(object)
  }

  @Get
  getUsersList() {
    return usersService.getUsersList()
  }
}
```


*Service*:
```javascript
import {Service, Inject} from 'nodespring'
import DBService from '../interfaces/DBService'


@Service
export default class MyUsersService {

  @Inject(DBService)
  dbService

  saveUser(user) {
    return dbService.saveEntity('Users', object)
  }

  getUsersList() {
    return dbService.getEntityList('Users')
  }
}
```


*Interface*:
```javascript
import {Interface} from 'nodespring'


@Interface
export default class DBService {

  find(entityType, entity) {}
  getEntityList(entityType) {}
}

```


*Implementation*:
```javascript
import {Implements, Inject} from 'nodespring'
import DBService from './../interfaces/DBService'
// import your mongo library


@Implements(DBService)
export default class DBServiceMongoImpl {

  saveEntity(entityType, entity) {
    return new Promise((resolve, reject) => {
        // MongoDB stuff
        
        resolve(response)
    })
  }

  getEntityList(entityType) {
    return new Promise((resolve, reject) => {
        // MongoDB stuff
        
        resolve(usersList)
    })
  }
}

```

Notice that you aren't using MongoDB directly in your service layer, instead, you have a specific implementation to deal with DB operations, if the database engine needs to be changed in the future, you only need to create a new implementation of the interface **DBService**.


*Unit Test*:

```javascript
import {Mock, Test, Before, InjectMocks, TestClass} from 'nodespring'

import MyUsersService from '../services/MyUsersService'
import DBService from './../interfaces/DBService'


@TestClass
export default class MyUsersServiceTest {

  @Mock(DBService)
  dbServiceMock
  
  @InjectMocks(MyUsersService)
  myUsersService
  
  @Before
  initTest() {
    // stuff before each test
  }
  
  @Test
  test1(assert) {
    this.dbServiceMock.saveEntity = (entityType, entity) => {
    
      // Simulating async behavior
      setTimeout(() => {
      
        // You can use all the methods in "assert" npm package
        assert.equal(true, true)
        
        // Call done() method to finish the current test like in NodeUnit
        assert.done()
      }, 5000)
    }
  }
  
  @Test
  test2(assert) {
    assert.ok(true)
    assert.done()
  }
}

```


## Examples
There's an example application created by using *NodeSpring* in this repository:

https://github.com/calbertts/nodespring-example


**All of this is in progress, so it can be changed.**
