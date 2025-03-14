class MyClass {
  constructor() {
    this.__ae444707 = 42;
  }
  __42ee355a() {
    console.log(this.__ae444707);
    console.log("__ae444707" in this);
  }
  out() {
    this.__42ee355a();
  }
  static __6eb46d85() {
    console.log(this.__e763e2d3);
    console.log("__e763e2d3" in this);
  }
  static staticOut() {
    this.__6eb46d85();
  }
  static {
    this.__e763e2d3 = 10;
  }
}
