/**
 * Abstract
 * @calbertts
 */

import NodeSpringUtil from './NodeSpringUtil'
import NodeSpringException from '../exceptions/NodeSpringException'


export default class Abstract {
  constructor() {
    if (new.target === Abstract || Object.getPrototypeOf(this.constructor).name === 'Abstract') {
      let noInstantiable = new NodeSpringException("Cannot construct "+this.constructor.name+" instances directly", this, 1);
      NodeSpringUtil.throwNodeSpringException(noInstantiable)
    }
  }
}