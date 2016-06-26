'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _NodeSpringApp2 = require('../core/NodeSpringApp');

var _NodeSpringApp3 = _interopRequireDefault(_NodeSpringApp2);

var _NodeSpringUtil = require('../core/NodeSpringUtil');

var _NodeSpringUtil2 = _interopRequireDefault(_NodeSpringUtil);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _cluster = require('cluster');

var _cluster2 = _interopRequireDefault(_cluster);

var _stickySession = require('sticky-session');

var _stickySession2 = _interopRequireDefault(_stickySession);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Express Middleware
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author calbertts
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var ExpressApp = function (_NodeSpringApp) {
  _inherits(ExpressApp, _NodeSpringApp);

  function ExpressApp(config) {
    _classCallCheck(this, ExpressApp);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ExpressApp).call(this, config));

    _this.socketListeners = {};
    _this.configExpressApp();
    return _this;
  }

  _createClass(ExpressApp, [{
    key: 'bindURL',
    value: function bindURL(method, url, callback) {
      this.expressApp[method](url, callback);
    }
  }, {
    key: 'addSocketListeners',
    value: function addSocketListeners(namespace, socketListeners, instance) {
      var _this2 = this;

      socketListeners.forEach(function (socketListenerData) {
        if (namespace in _this2.socketListeners) {
          _this2.socketListeners[namespace].instance = instance;
          _this2.socketListeners[namespace].events[socketListenerData.eventName] = instance[socketListenerData.methodName];
        } else {
          _this2.socketListeners[namespace] = {
            instance: instance,
            events: _defineProperty({}, socketListenerData.eventName, instance[socketListenerData.methodName])
          };
        }
      });
    }
  }, {
    key: 'getRequestParams',
    value: function getRequestParams(request, callback) {
      var clientData = request.body || request.query;
      callback(clientData);
    }
  }, {
    key: 'setContentTypeResponse',
    value: function setContentTypeResponse(response, contentType) {
      response.contentType(contentType || 'text/html');
    }
  }, {
    key: 'sendJSONResponse',
    value: function sendJSONResponse(response, data) {
      response.json(data);
    }
  }, {
    key: 'sendDataResponse',
    value: function sendDataResponse(response, data) {
      response.send(data);
    }
  }, {
    key: 'configExpressApp',
    value: function configExpressApp() {
      var _this3 = this;

      var port = this.config.port;
      var hostname = this.config.hostname || 'localhost';

      this.expressApp = (0, _express2.default)();

      if (this.config.https) {
        var options = {
          key: _fs2.default.readFileSync(this.config.https.key),
          cert: _fs2.default.readFileSync(this.config.https.cert)
        };

        this.server = _https2.default.createServer(options, this.expressApp);
      } else {
        this.server = _http2.default.createServer(this.expressApp);
      }

      if (this.config.loadbalancer) {
        if (!_stickySession2.default.listen(this.server, port)) {
          this.server.once('listening', function () {
            console.log('Server running at http://' + hostname + ':' + port);
          });
        } else {
          this.bindURL('get', '/', function (req, res) {
            if (_this3.config.rootController) _this3.config.rootController(req, res);else res.send('');
          });
        }

        _cluster2.default.on('exit', function (worker) {
          console.log('Worker %d died :(', worker.id);
          _cluster2.default.fork();
        });
      } else {
        this.bindURL('get', '/', function (req, res) {
          if (_this3.config.rootController) _this3.config.rootController(req, res);else res.send('');
        });

        this.server.listen(port, hostname, function () {
          console.log('Server running at http://' + hostname + ':' + port);
        });
      }
    }
  }, {
    key: 'configureSocketListeners',
    value: function configureSocketListeners() {
      var _this4 = this;

      this.io = require('socket.io')(this.server);

      var socketListeners = this.socketListeners;

      var _loop = function _loop(namespace) {
        var namespaceData = socketListeners[namespace];
        var scope = _this4.io.of(namespace);
        namespaceData.instance.clientsNamespace = scope;

        scope.on('connection', function (socket) {
          if ('onConnection' in namespaceData.instance) {
            namespaceData.instance.onConnection(socket, scope);
          }

          var _loop2 = function _loop2(eventName) {
            socket.on(eventName, function (data) {
              var instance = namespaceData.instance;
              var method = namespaceData.events[eventName];

              method.call(instance, data, socket, scope);
            });
          };

          for (var eventName in namespaceData.events) {
            _loop2(eventName);
          }
        });
      };

      for (var namespace in socketListeners) {
        _loop(namespace);
      }
    }
  }]);

  return ExpressApp;
}(_NodeSpringApp3.default);

exports.default = ExpressApp;
//# sourceMappingURL=ExpressApp.js.map