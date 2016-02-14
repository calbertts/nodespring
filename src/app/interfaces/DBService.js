/**
 * DBService
 */


export default class DBService {

  find(type, where) {
    return {
      params: {
        type: Object,
        where: Object
      },
      returnValue: Object
    }
  }

  save(object) {
    return {
      params: {
        object: Object
      },
      returnValue: Object
    }
  }
}
