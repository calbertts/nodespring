/**
 * Abstract
 * @calbertts
 */

import NodeSpringUtil from './NodeSpringUtil'
import NodeSpringException from '../exceptions/NodeSpringException'


export default class Abstract {
  constructor() {
  	// new.target === Abstract ||   ... removed because need to downgrade to 4.6.0
    if (Object.getPrototypeOf(this.constructor).name === 'Abstract') {
      let noInstantiable = new NodeSpringException("Cannot construct "+this.constructor.name+" instances directly", this, 1);
      NodeSpringUtil.throwNodeSpringException(noInstantiable)
    }
  }
}