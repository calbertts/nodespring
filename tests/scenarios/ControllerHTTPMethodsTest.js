import TestUtil from './../TestUtil.js'

import NodeSpringApp from '../../src/core/NodeSpringApp'
import {Controller} from '../../src/decorators/controller'
import {Post, Get} from '../../src/decorators/httpMethods'
import {SocketListener} from '../../src/decorators/sockets'


TestUtil.run(function ControllerHTTPMethodsTest(done, fail) {

  class TestNodeSpringApp extends NodeSpringApp {
    bindURL(method, url, callback) {}
    getRequestParams(request, callback) {}
    setContentTypeResponse(response, contentType) {}
    sendJSONResponse(response, data) {}
    sendDataResponse(response, data) {}
    addSocketListeners(namespace, socketListeners, instance) {}
  }

  TestUtil.setup({
    nodeSpringApp: new TestNodeSpringApp()
  })

  @Controller({path: 'myPath', namespace: '/server'})
  class MyController {

    @Get
    postMethod(postParams) {}

    @Post({contentType: 'application/json'})
    getMethod(getParams) {}

    @SocketListener
    onClientEvent() {

    }
  }

  let controllerData = TestUtil.getModuleContainer()['/scenarios/MyController']
  let postMethod = controllerData.methods[0]
  let getMethod = controllerData.methods[1]

  if(postMethod.methodName === 'postMethod' &&
     postMethod.httpMethod === 'get' &&
     postMethod.contentType === 'text/html' &&

     getMethod.methodName === 'getMethod' &&
     getMethod.httpMethod === 'post' &&
     getMethod.contentType === 'application/json'
  ) {
    done()
  } else {
    fail('Controller metadata is not correct')
  }
})