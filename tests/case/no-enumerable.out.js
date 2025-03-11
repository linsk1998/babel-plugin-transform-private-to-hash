class MyClass {
  constructor() {
    Object.defineProperty(this, "__9ee5cea2", {
      value: 42,
      enumerable: false,
      configurable: true,
      writable: true
    });
  }
  __7757f15a() {
    console.log(this.__9ee5cea2);
    console.log("__9ee5cea2" in this);
  }
  out() {
    this.__7757f15a();
  }
  static __4e8b84c0() {
    console.log(this.__93a8ee2d);
    console.log("__93a8ee2d" in this);
  }
  static staticOut() {
    this.__4e8b84c0();
  }
  static {
    Object.defineProperty(this, "__93a8ee2d", {
      value: 10,
      enumerable: false,
      configurable: true,
      writable: true
    });
  }
}
