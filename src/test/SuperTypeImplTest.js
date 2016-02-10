/**
 * Testing MyClass
 *
 * @author calbertts
 */

import SuperTypeImpl from '../app/SuperTypeImpl'


export default class SuperTypeImplTest {

  // @Mock(SuperType)
  // users;

  //superType = new SuperTypeImpl()


  // @Test
  firstTest() {
    // When(this.users.methodOne).thenReturn()
    // When(this.users.methodOne).thenThrow
    // When(this.users.methodOne).then((args) => {})

    this.users.methodOne()
  }
}