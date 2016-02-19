# NodeSpring

Dependency Injection and Unit testing using Javascript decorators


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
  
## Examples
There's an example application created by using *NodeSpring* in this repository:

https://github.com/calbertts/nodespring-example


**All of this is in progress, so it can be changed.**