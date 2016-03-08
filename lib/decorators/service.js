'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Service = Service;

var _ModuleContainer = require('../core/ModuleContainer');

var _ModuleContainer2 = _interopRequireDefault(_ModuleContainer);

var _NodeSpringUtil = require('../core/NodeSpringUtil');

var _NodeSpringUtil2 = _interopRequireDefault(_NodeSpringUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Service decorator
 * @author calbertts
 */

function Service(serviceClass) {
  var packagePath = _NodeSpringUtil2.default.getStack().replace(_ModuleContainer2.default.appDir, '').replace('.js', '');

  serviceClass.packagePath = packagePath;
  serviceClass.moduleType = 'service';

  _ModuleContainer2.default.addService(serviceClass);
}
//# sourceMappingURL=service.js.map