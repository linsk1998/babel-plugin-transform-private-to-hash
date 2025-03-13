class MyClass {
  #foo = 42;
  static #bar = 10;
  #in() {
    console.log(this.#foo);
    console.log(#foo in this);
  }
  get #accessor() {
    return 1;
  }
  out() {
    this.#in(this.#accessor);
  }
  static #staticIn() {
    console.log(this.#bar);
    console.log(#bar in this);
  }
  static staticOut() {
    this.#staticIn();
  }
}
