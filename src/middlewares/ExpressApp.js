/**
 * Express Middleware
 * @author calbertts
 */

import NodeSpringApp from '../core/NodeSpringApp'
import express from 'express'


export default class ExpressApp extends NodeSpringApp {

  constructor(config) {
    super(config)

    this.configExpressApp()
  }

  bindURL(method, url, callback) {
    this.expressApp[method](url, callback)
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

    this.bindURL('get', '/', (req, res) => {
      res.send('Hello World!');
    })

    this.expressApp.listen(port, function () {
      console.log('Server running at http://localhost:5000');
    })
  }
}