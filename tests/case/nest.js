class MyClass {
  #foo = 42;
  #bar = 10;
  out() {
    class MyClass {
      #foo = 42;
      out() {
        console.log(this.#foo);
        console.log(#bar in this);
      }
    }
    console.log(MyClass);
  }
}
