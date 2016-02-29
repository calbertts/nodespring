'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Service = Service;

var _moduleContainer = require('../core/moduleContainer');

var _moduleContainer2 = _interopRequireDefault(_moduleContainer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Service(target) {
  target.moduleType = 'service';
  _moduleContainer2.default.addService(target);
} /**
   * Service decorator
   * @author calbertts
   */
//# sourceMappingURL=service.js.map