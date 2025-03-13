const fs = require("fs");
const assert = require('assert');
const { transform } = require("@babel/core");
const plugin = require("../src/index");

function test(title, options) {
	it(title, function () {
		const file = 'tests/case/' + title;
		const fileIn = file + '.js';
		const fileOut = file + '.out.js';
		// 使用 Fixture 作为输入
		const inputCode = fs.readFileSync(fileIn, 'utf8');
		// 调用插件转换
		const { code } = transform(inputCode, {
			filename: fileIn,
			plugins: [[plugin, options]]
		});
		// 验证输出
		assert.strictEqual(code.trim(), fs.readFileSync(fileOut, 'utf8').trim());
	});
}

describe('babel-plugin-transform-private-to-hash', function () {
	test('property', {
		enumerable: true
	});
	test('method', {
		enumerable: true
	});
	test('hashLength', {
		enumerable: true,
		hashLength: 6
	});
	test('enumerable', {
		enumerable: true
	});
	test('no-enumerable', {

	});
	test('nest', {
		enumerable: true
	});
});
