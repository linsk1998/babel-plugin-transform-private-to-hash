class SuperClass {
  #foo = 42;
  static #bar = 10;
  #in() {
    console.log(this.#foo);
    console.log(#foo in this);
  }
  out() {
    this.#in();
  }
  static #staticIn() {
    console.log(this.#bar);
    console.log(#bar in this);
  }
  static staticOut() {
    this.#staticIn();
  }
}

class SubClass extends SuperClass {
  #foo = 44;
  static #bar = 45;
}

class SubClass2 extends SuperClass {
  #foo = 44;
  constructor() {
    super()
    alert(1)
  }
}
