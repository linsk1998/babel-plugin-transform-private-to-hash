# babel-plugin-transform-private-to-hash

[![npm](https://img.shields.io/npm/v/babel-plugin-transform-private-to-hash)](https://www.npmjs.com/package/babel-plugin-transform-private-to-hash)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![CI Status](https://github.com/linsk1998/babel-plugin-transform-private-to-hash/actions/workflows/ci.yml/badge.svg)](https://github.com/linsk1998/babel-plugin-transform-private-to-hash/actions)

A Babel plugin that transforms ES2022+ private class fields/methods into public properties with hashed names, supporting configurable salt and hash length.

## Features

- 🔒 Converts private fields/methods to uniquely hashed public properties
- 🧂 Configurable salt for hash generation
- 📏 Customizable hash length (1-32 chars)
- 🚫 Configurable enumerability (default: false)
- 💪 Full support for static/instance properties and methods
- ✅ Handles `in` operator checks correctly

## Installation

```bash
npm install --save-dev babel-plugin-transform-private-to-hash
```

## Usage

### Via `.babelrc`

```json
{
  "plugins": [
    ["transform-private-to-hash", {
      "salt": "my-secret-salt",
      "enumerable": false,
      "hashLength": 8
    }]
  ]
}
```

## Configuration Options

| Option         | Type    | Default | Description                                             |
| -------------- | ------- | ------- | ------------------------------------------------------- |
| **salt**       | string  | `''`    | Salt value for hash generation                          |
| **enumerable** | boolean | `false` | Whether the transformed properties should be enumerable |
| **hashLength** | number  | `8`     | Length of the hash substring (1-32)                     |

## Examples

### Basic Transformation

**Input:**

```javascript
class MyClass {
  #privateField = 42;
  #method() {}
  static #staticField = 10;

  check() {
    return #privateField in this && this.#method();
  }
}
```

**Output (with default config):**

```javascript
class MyClass {
  static {
    Object.defineProperty(this, "__a1b2c3d4", {
      value: 10,
      enumerable: false,
      configurable: true,
      writable: true
    });
  }

  constructor() {
    Object.defineProperty(this, "__e5f6g7h8", {
      value: 42,
      enumerable: false,
      configurable: true,
      writable: true
    });
  }

  __i9j0k1l2() {}

  check() {
    return "__e5f6g7h8" in this && this.__i9j0k1l2();
  }
}
```

### Configurable Hash Length

**Config:**

```json
{ "hashLength": 4 }
```

**Output Property Name:**

```javascript
__a1b2
```

### Enumerable Mode

**Config:**

```json
{ "enumerable": true }
```

**Output:**

```javascript
class MyClass {
  __a1b2c3d4 = 42;
  static __e5f6g7h8 = 10;
}
```
