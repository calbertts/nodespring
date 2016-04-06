import TestUtil from './../TestUtil.js'

import NodeSpringApp from '../../src/core/NodeSpringApp'
import {Controller} from '../../src/decorators/controller'
import {Post, Get} from '../../src/decorators/httpMethods'
import {SocketListener} from '../../src/decorators/sockets'


TestUtil.run(function ControllerSocketListenersTest(done, fail) {

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

  @Controller({namespace: '/server'})
  class MyController {

    @SocketListener
    onClientEvent() {}

    @SocketListener({eventName: 'customEvent'})
    onCustomClientEvent() {}
  }

  let controllerData = TestUtil.getModuleContainer()['/scenarios/MyController']
  let onClientEventData = controllerData.socketListeners[0]
  let onCustomClientData = controllerData.socketListeners[1]

  if(onClientEventData.methodName === 'onClientEvent' &&
     onClientEventData.eventName === 'onClientEvent' &&

     onCustomClientData.methodName === 'onCustomClientEvent' &&
     onCustomClientData.eventName === 'customEvent'
  ) {
    done()
  } else {
    fail('Controller metadata is not correct')
  }
})