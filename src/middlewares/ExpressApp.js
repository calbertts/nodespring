/**
 * Express Middleware
 * @author calbertts
 */

import NodeSpringApp from '../core/NodeSpringApp'
import NodeSpringUtil from '../core/NodeSpringUtil'
import express from 'express'
import cluster from 'cluster'
import sticky from 'sticky-session'
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

  addSocketListeners(namespace, socketListeners, instance) {
    socketListeners.forEach((socketListenerData) => {
      if(namespace in this.socketListeners) {
        this.socketListeners[namespace].instance = instance
        this.socketListeners[namespace].events[socketListenerData.eventName] = instance[socketListenerData.methodName]
      } else {
        this.socketListeners[namespace] = {
          instance: instance,
          events: {
            [socketListenerData.eventName]: instance[socketListenerData.methodName]
          }
        }
      }
    })
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
    const hostname = this.config.hostname || 'localhost'

    this.expressApp = express()
    this.server = http.createServer(this.expressApp)

    if(this.config.loadbalancer) {
      if (!sticky.listen(this.server, port)) {
        this.server.once('listening', () => {
          console.log(`Server running at http://${hostname}:${port}`)
        })
      } else {
        this.bindURL('get', '/', (req, res) => {
          res.send('Hello World!');
        })
      }

      cluster.on('exit', function (worker) {
        console.log('Worker %d died :(', worker.id)
        cluster.fork()
      })
    } else {
      this.bindURL('get', '/', (req, res) => {
        res.send('Hello World!');
      })

      this.server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}`)
      })
    }
  }

  configureSocketListeners() {
    this.io = require('socket.io')(this.server)

    let socketListeners = this.socketListeners

    for(let namespace in socketListeners) {
      let namespaceData = socketListeners[namespace]
      let scope = this.io.of(namespace)
      namespaceData.instance.clientsNamespace = scope

      scope.on('connection', (socket) => {
        if('onConnection' in namespaceData.instance) {
          namespaceData.instance.onConnection(socket, scope)
        }

        for(let eventName in namespaceData.events) {
          socket.on(eventName, (data) => {
            let instance = namespaceData.instance
            let method = namespaceData.events[eventName]

            method.call(instance, data, socket, scope)
          })
        }
      })
    }
  }
}