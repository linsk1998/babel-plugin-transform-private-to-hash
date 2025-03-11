class SuperClass {
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
class SubClass extends SuperClass {
  constructor() {
    super(...arguments);
    Object.defineProperty(this, "__fb34dd4f", {
      value: 44,
      enumerable: false,
      configurable: true,
      writable: true
    });
  }
  static {
    Object.defineProperty(this, "__7808ad86", {
      value: 45,
      enumerable: false,
      configurable: true,
      writable: true
    });
  }
}
class SubClass2 extends SuperClass {
  constructor() {
    super();
    Object.defineProperty(this, "__4cfae5a1", {
      value: 44,
      enumerable: false,
      configurable: true,
      writable: true
    });
    alert(1);
  }
}
