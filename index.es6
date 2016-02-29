import {ModuleContainer} from './lib/core/moduleContainer'
import {Get, Post} from './lib/decorators/httpMethods'
import {Interface, Implements, Inject, PostInject, Scope} from './lib/decorators/dependencyManagement'
import {Controller} from './lib/decorators/controller'
import {Service} from './lib/decorators/service'
import {Mock, TestClass, Test, Before, InjectMocks} from './lib/decorators/testing'

import ExpressApp from './lib/middlewares/ExpressApp'

exports.ModuleContainer = ModuleContainer
exports.Get = Get
exports.Post = Post
exports.Interface = Interface
exports.Implements = Implements
exports.Scope = Scope
exports.Inject = Inject
exports.Controller = Controller
exports.Service = Service
exports.Mock = Mock
exports.Test = Test
exports.Before = Before
exports.InjectMocks = InjectMocks
exports.TestClass = TestClass
exports.PostInject = PostInject
exports.ExpressApp = ExpressApp
