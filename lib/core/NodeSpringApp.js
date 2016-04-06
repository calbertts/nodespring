'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ModuleContainer = require('./ModuleContainer');

var _ModuleContainer2 = _interopRequireDefault(_ModuleContainer);

var _Abstract2 = require('./Abstract');

var _Abstract3 = _interopRequireDefault(_Abstract2);

var _NodeSpringUtil = require('./NodeSpringUtil');

var _NodeSpringUtil2 = _interopRequireDefault(_NodeSpringUtil);

var _NodeSpringException = require('../exceptions/NodeSpringException');

var _NodeSpringException2 = _interopRequireDefault(_NodeSpringException);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * NodeSpringApp
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @author calbertts
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var NodeSpringApp = function (_Abstract) {
  _inherits(NodeSpringApp, _Abstract);

  function NodeSpringApp(config) {
    _classCallCheck(this, NodeSpringApp);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(NodeSpringApp).call(this));

    _this.config = config;

    // Global settings
    if (!global.NodeSpringConfig) {
      global.NodeSpringConfig = {};
    }

    global.NodeSpringConfig.printExceptions = true;

    // Checking methods that need to be implemented
    var requiredMethods = {
      bindURL: ['method', 'url', 'callback'],
      getRequestParams: ['request', 'callback'],
      setContentTypeResponse: ['response', 'contentType'],
      sendJSONResponse: ['response', 'data'],
      sendDataResponse: ['response', 'data'],
      addSocketListeners: ['namespace', 'socketListeners', 'instance']
    };

    var _loop = function _loop(methodName) {
      if (_this[methodName] === undefined) {
        var noImplementedMethod = new _NodeSpringException2.default('The method ' + methodName + ' must be implemented on ' + _this.__proto__.__proto__.constructor.name);

        _NodeSpringUtil2.default.throwNodeSpringException(noImplementedMethod);
      } else {
        (function () {
          var methodParams = requiredMethods[methodName];

          // Check the parameters
          var implementedMethodParams = _NodeSpringUtil2.default.getArgs(_this[methodName]);

          methodParams.forEach(function (officialParam) {
            if (implementedMethodParams.indexOf(officialParam) < 0) {
              var missingParameter = new _NodeSpringException2.default('The parameter "' + officialParam + '" is not present on the implemented method "' + methodName + '(...)" in the class ' + _this.__proto__.__proto__.constructor.name, undefined, 6);
              _NodeSpringUtil2.default.throwNodeSpringException(missingParameter);
            }
          });
        })();
      }
    };

    for (var methodName in requiredMethods) {
      _loop(methodName);
    }
    return _this;
  }

  _createClass(NodeSpringApp, [{
    key: 'start',
    value: function start() {
      _ModuleContainer2.default.init(this.config.classDir, this, this.config.implConfig, this.config.logging, this.config.loggingSync, this.config.debugging);
      _ModuleContainer2.default.loadModules();
    }
  }]);

  return NodeSpringApp;
}(_Abstract3.default);

exports.default = NodeSpringApp;
//# sourceMappingURL=NodeSpringApp.js.map