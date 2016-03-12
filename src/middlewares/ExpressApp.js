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

    this.listeners = {}
    this.configExpressApp()
  }

  bindURL(method, url, callback) {
    this.expressApp[method](url, callback)
  }

  addSocketListener(event, handler, instance) {
    this.listeners[event] = {
      instance: instance,
      handler: handler
    }
  }

  getRequestParams(request, callback) {
    let clientData = request.body || request.query
    callback(clientData)
  }

  setContentTypeResponse(response, contentType) {
    response.contentType(contentType)
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

    var server = http.createServer(this.expressApp)
    var io = require('socket.io')(server)

    this.bindURL('get', '/', (req, res) => {
      res.send('Hello World!');
    })

    io.on('connection', (socket) => {
      NodeSpringUtil.debug('SETTING UP', this.listeners)

      for(let event in this.listeners) {
        socket.on(event, (data) => {
          NodeSpringUtil.debug('SUBMETHOD!', data)

          let instance = this.listeners[event].instance
          let method = this.listeners[event].handler

          method.call(instance, data, socket, io)
        })
      }
    })

    server.listen(port, function () {
      NodeSpringUtil.log('Server running at http://localhost:5000');
    })
  }
}