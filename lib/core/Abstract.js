'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _NodeSpringUtil = require('./NodeSpringUtil');

var _NodeSpringUtil2 = _interopRequireDefault(_NodeSpringUtil);

var _NodeSpringException = require('../exceptions/NodeSpringException');

var _NodeSpringException2 = _interopRequireDefault(_NodeSpringException);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                           * Abstract
                                                                                                                                                           * @calbertts
                                                                                                                                                           */

var Abstract = function Abstract() {
  _classCallCheck(this, Abstract);

  if (new.target === Abstract || Object.getPrototypeOf(this.constructor).name === 'Abstract') {
    var noInstantiable = new _NodeSpringException2.default("Cannot construct " + this.constructor.name + " instances directly", this, 1);
    _NodeSpringUtil2.default.throwNodeSpringException(noInstantiable);
  }
};

exports.default = Abstract;
//# sourceMappingURL=Abstract.js.map