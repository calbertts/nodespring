'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Service = Service;

var _ModuleContainer = require('../core/ModuleContainer');

var _ModuleContainer2 = _interopRequireDefault(_ModuleContainer);

var _NodeSpringUtil = require('../core/NodeSpringUtil');

var _NodeSpringUtil2 = _interopRequireDefault(_NodeSpringUtil);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Service(serviceClass) {
  var basePackagePath = _path2.default.dirname(_NodeSpringUtil2.default.getStack().replace(_ModuleContainer2.default.appDir, '').replace('.js', ''));
  var packagePath = basePackagePath + '/' + serviceClass.name;

  serviceClass.packagePath = serviceClass.packagePath || packagePath;
  serviceClass.moduleType = 'service';

  _ModuleContainer2.default.addService(serviceClass);
} /**
   * Service decorator
   * @author calbertts
   */
//# sourceMappingURL=service.js.map