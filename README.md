# NodeSpring

```bash
npm install nodespring
```


## Why I made this?
If you have worked with Java and Spring you have learned some concepts and ways to code and test that can be challenge to find out on NodeJS.
I'm conscious about Javascript has its own nature, but please, don't hate me because with this I'm making Javascript more like Java, at least with the syntax, I just want to make the developer's life easier by reducing the bolierplate code, that's all.
 
Although Dependency Injection (DI) is a concept which is used in several programming languages including Javascript, I have to say, I love the way Spring does, that's why I wanted to have the nice syntax to declare dependencies from Spring and also, the great features and flexibility you can have with Javascript.

It's important to mention that Unit Testing is easier when you use DI, creating references to interfaces instead of implementations is a good practice if you want to have decoupled and maintainable code.


## Concepts
First of all, I want to give you a general review of the concepts used by NodeSpring:

* **Controllers**
  Basically the end points where you deal with HTTP methods (GET, POST, etc.) and invoke the service layer
  
* **Services**
  If you divide your application in modules, it's nice to have a service layer where you define the way that other modules are going to communicate with the other ones

* **Interfaces and Implementations**
  An interface in *NodeSpring* is a Javascript class (ES6) where you define methods without business logic, just the definition and a specific format explained in the documentation.
  An implementation is a class that implements all the methods defined on the interface.

* **Unit testing**
  This is basically the ability to isolate your Service/Implementation code to be tested, the isolation can be achieved using mocks, *NodeSpring* has a mechanism to do it.


## How they looks like?
A *Controller* looks like this:

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

A service like this:

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

An implementation like this:

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


## Examples
There's an example application created by using *NodeSpring* in this repository:

https://github.com/calbertts/nodespring-example


**All of this is in progress, so it can be changed.**