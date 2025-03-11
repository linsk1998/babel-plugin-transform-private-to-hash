import type { NodePath, PluginPass, types as t } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import path = require('path');
import slash = require('slash');
import murmurhash = require('murmurhash');

interface PluginOptions {
	salt?: string;
	enumerable?: boolean;
	hashLength?: number;
}

interface PluginState extends PluginPass {
	classCounter: number;
	classHashStore: WeakMap<t.Node, Map<string, string>>;
}

export = declare((api, options: PluginOptions = {}) => {
	api.assertVersion(7);
	const t = api.types;
	const { salt = '', enumerable = false, hashLength = 8 } = options;
	return {
		name: 'transform-private-to-hash',
		pre(file) {
			this.classCounter = 0;
			this.classHashStore = new WeakMap();
		},
		visitor: {
			Class(classPath: NodePath<t.Class>, state: PluginState) {
				const filePath = state.filename || '';
				const cwd = process.cwd();
				const relativePath = slash(filePath.startsWith(cwd) ? filePath.slice(cwd.length) : filePath);
				const classIndex = state.classCounter++;

				const privateHashes = new Map<string, string>();

				// 收集所有私有属性和方法的哈希
				classPath.node.body.body.forEach(prop => {
					if(t.isClassPrivateProperty(prop) || t.isClassPrivateMethod(prop)) {
						const privateName = prop.key.id.name;
						const hashInput = `${salt}_${relativePath}_${classIndex}_${privateName}`;
						const fullHash = murmurhash.v3(hashInput).toString(16);
						const hash = fullHash.slice(0, hashLength);
						privateHashes.set(privateName, `__${hash}`);
					}
				});
				state.classHashStore.set(classPath.node, privateHashes);

				// 处理不可枚举的情况
				if(!enumerable) {
					const staticFields: Map<string, t.Expression> = new Map();
					const instanceFields: Map<string, t.Expression> = new Map();
					const bodyBodyPaths = classPath.get('body.body') as NodePath[];
					bodyBodyPaths.forEach(propPath => {
						let prop = propPath.node;
						if(t.isClassPrivateProperty(prop)) {
							if(prop.static) {
								staticFields.set(prop.key.id.name, prop.value);
							} else {
								instanceFields.set(prop.key.id.name, prop.value);
							}
							propPath.remove();
						}
					});

					// 处理实例字段
					if(instanceFields.size > 0) {
						let constructorPath: NodePath<t.ClassMethod> = bodyBodyPaths.find(p => p.isClassMethod() && p.node.kind === 'constructor') as any;
						if(!constructorPath) {
							let constructorNode = t.classMethod(
								'constructor',
								t.identifier('constructor'),
								[],
								t.blockStatement(
									classPath.node.superClass ?
										[t.expressionStatement(t.callExpression(t.super(), [t.spreadElement(t.identifier('arguments'))]))] :
										[],
								)
							);
							const bodyPath: NodePath<t.ClassBody> = classPath.get('body');
							constructorPath = bodyPath.unshiftContainer('body', constructorNode)[0];
						}

						instanceFields.forEach((express, name) => {
							let statement = t.expressionStatement(
								t.callExpression(
									t.memberExpression(t.identifier('Object'), t.identifier('defineProperty')),
									[
										t.thisExpression(),
										t.stringLiteral(privateHashes.get(name)),
										t.objectExpression([
											t.objectProperty(t.identifier('value'), express),
											t.objectProperty(t.identifier('enumerable'), t.booleanLiteral(false)),
											t.objectProperty(t.identifier('configurable'), t.booleanLiteral(true)),
											t.objectProperty(t.identifier('writable'), t.booleanLiteral(true)),
										])
									]
								)
							);
							let superPath = constructorPath.get('body.body').find(p => {
								if(p.isExpressionStatement()) {
									let callee: NodePath = p.get('expression.callee') as any;
									if(callee && callee.isSuper()) {
										return true;
									}
								}
								return false;
							});
							if(superPath) {
								superPath.insertAfter(statement);
							} else {
								constructorPath.get('body').unshiftContainer('body', statement);
							}
						});
					}
					// 处理静态字段
					if(staticFields.size > 0) {
						const staticBlockBody: t.ExpressionStatement[] = [];
						staticFields.forEach((express, name) => {
							staticBlockBody.push(
								t.expressionStatement(
									t.callExpression(
										t.memberExpression(t.identifier('Object'), t.identifier('defineProperty')),
										[
											t.thisExpression(),
											t.stringLiteral(privateHashes.get(name)),
											t.objectExpression([
												t.objectProperty(t.identifier('value'), express),
												t.objectProperty(t.identifier('enumerable'), t.booleanLiteral(false)),
												t.objectProperty(t.identifier('configurable'), t.booleanLiteral(true)),
												t.objectProperty(t.identifier('writable'), t.booleanLiteral(true)),
											])
										]
									)
								)
							);
						});
						(classPath.get('body') as NodePath<t.ClassBody>).pushContainer('body',
							t.staticBlock(staticBlockBody)
						);
					}
				}
			},

			ClassPrivateProperty(propertyPath: NodePath<t.ClassPrivateProperty>, state: PluginState) {
				const classPath = propertyPath.findParent(p => p.isClass());
				const privateNode = propertyPath.node;
				const hashes = state.classHashStore.get(classPath.node);
				if(hashes) {
					const privateName = privateNode.key.id.name;
					const hash = hashes.get(privateName);
					if(hash) {
						if(enumerable) {
							propertyPath.replaceWith(t.classProperty(t.identifier(hash), privateNode.value, null, null, false, privateNode.static));
						} else {
							propertyPath.remove();
						}
					}
				}
			},
			ClassPrivateMethod(methodPath: NodePath<t.ClassPrivateMethod>, state: PluginState) {
				const classPath = methodPath.findParent(p => p.isClass());
				const privateNode = methodPath.node;
				const hashes = state.classHashStore.get(classPath.node);
				if(hashes) {
					const privateName = privateNode.key.id.name;
					const hash = hashes.get(privateName);
					if(hash) {
						methodPath.replaceWith(t.classMethod("method", t.identifier(hash), privateNode.params, privateNode.body, false, privateNode.static, privateNode.generator, privateNode.async));
					}
				}
			},

			MemberExpression(memberExpPath: NodePath<t.MemberExpression>, state: PluginState) {
				const propertyPath = memberExpPath.get('property') as NodePath<t.PrivateName>;
				const propertyNode = propertyPath.node;
				if(!t.isPrivateName(propertyNode)) return;

				memberExpPath.findParent(parentPath => {
					if(parentPath.isClass) {
						const hashes = state.classHashStore.get(parentPath.node);
						if(hashes) {
							const privateName = propertyNode.id.name;
							const hash = hashes.get(privateName);
							if(hash) {
								propertyPath.replaceWith(t.identifier(hash));
								return true;
							}
						}
					}
					return false;
				});
			},

			BinaryExpression(binaryPath: NodePath<t.BinaryExpression>, state: PluginState) {
				const leftPath = binaryPath.get('left') as NodePath<t.PrivateName>;
				const leftNode = leftPath.node;
				if(!t.isPrivateName(leftNode)) return;

				binaryPath.findParent(parentPath => {
					if(parentPath.isClass()) {
						const hashes = state.classHashStore.get(parentPath.node);
						if(hashes) {
							const privateName = leftNode.id.name;
							const hash = hashes.get(privateName);
							if(hash) {
								leftPath.replaceWith(t.stringLiteral(hash));
								return true;
							}
						}
					}
					return false;
				});
			}
		}
	};
});
