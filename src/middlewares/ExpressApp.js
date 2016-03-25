/**
 * Express Middleware
 * @author calbertts
 */

import NodeSpringApp from '../core/NodeSpringApp'
import NodeSpringUtil from '../core/NodeSpringUtil'
import express from 'express'
import http from 'http'


export default class ExpressApp extends NodeSpringApp {

  constructor(config) {
    super(config)

    this.socketListeners = {}
    this.configExpressApp()
  }

  bindURL(method, url, callback) {
    this.expressApp[method](url, callback)
  }

  addSocketListener(socketListenerData, instance) {
    this.socketListeners[socketListenerData.namespace] = {
      [socketListenerData.eventName]: {
        instance: instance,
        handler: instance[socketListenerData.methodName]
      }
    }
  }

  getRequestParams(request, callback) {
    let clientData = request.body || request.query
    callback(clientData)
  }

  setContentTypeResponse(response, contentType) {
    response.contentType(contentType || 'text/html')
  }

  sendJSONResponse(response, data) {
    response.json(data)
  }

  sendDataResponse(response, data) {
    response.send(data)
  }

  configExpressApp() {
    const port = this.config.port
    this.expressApp = express()

    this.server = http.createServer(this.expressApp)

    this.bindURL('get', '/', (req, res) => {
      res.send('Hello World!');
    })

    this.server.listen(port, () => {
      NodeSpringUtil.log('Server running at http://localhost:5000');
    })
  }

  configureSocketListeners() {
    this.io = require('socket.io')(this.server)

    let socketListeners = this.socketListeners

    for(let namespace in socketListeners) {
      let namespaceData = socketListeners[namespace]

      for(let eventName in namespaceData) {
        var scope = this.io.of(namespace)

        scope.on('connection', (socket) => {
          console.log('Client connected to', namespace)
          socket.on(eventName, (data) => {
            let instance = namespaceData[eventName].instance
            let method = namespaceData[eventName].handler

            method.call(instance, data, socket, this.io)
          })
        })
      }
    }
  }
}