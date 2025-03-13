class MyClass {
  __2a9c952a = 42;
  static __f9802a0c = 10;
  __d98d839e() {
    console.log(this.__2a9c952a);
    console.log("__2a9c952a" in this);
  }
  get __3bd1b697() {
    return 1;
  }
  out() {
    this.__d98d839e(this.__3bd1b697);
  }
  static __59abbb62() {
    console.log(this.__f9802a0c);
    console.log("__f9802a0c" in this);
  }
  static staticOut() {
    this.__59abbb62();
  }
}
