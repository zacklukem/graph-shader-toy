import * as NodeLib from './node_generator';

test('node template correctly sets code field', () => {
  let input = `
	//@ Hello, World!
	void my_func(in vec2 a, in vec2 b, out vec3 my_name) {
		// [...]
	}
	`;
  let node = new NodeLib.TemplateNode(input);
  expect(node.code).toBe(input);
});

test('node template parses display name comment', () => {
  let input = `
	//@ Hello, World!
	void my_func(in vec2 a, in vec2 b, out vec3 my_name) {
		// [...]
	}
	`;
  let node = new NodeLib.TemplateNode(input);
  expect(node.display_name).toBe("Hello, World!");
});

test('node template transforms function name without display comment', () => {
  let input = `
	void my_func(in vec2 a, in vec2 b, out vec3 my_name) {
		// [...]
	}
	`;
  let node = new NodeLib.TemplateNode(input);
  expect(node.display_name).toBe("My Func");
});

test('node template template correctly parses function name', () => {
  let input = `
	void my_func(in vec2 a, in vec2 b, out vec3 my_name) {
		// [...]
	}
	`;
  let node = new NodeLib.TemplateNode(input);
  expect(node.function_name).toBe("my_func");
});

test('node template correctly parses parameters', () => {
  let input = `
	void my_func(in vec2 a_var, in vec2 b_var, out vec3 my_name) {
		// [...]
	}
	`;
  let node = new NodeLib.TemplateNode(input);
  expect(node.inputs).toHaveLength(2);
  expect(node.outputs).toHaveLength(1);
  expect(node.inputs[0].display_name).toBe("A Var");
  expect(node.inputs[0].name).toBe("a_var");
  expect(node.inputs[0].type).toBe(NodeLib.Type.VEC2);
  expect(node.inputs[1].display_name).toBe("B Var");
  expect(node.inputs[1].name).toBe("b_var");
  expect(node.inputs[1].type).toBe(NodeLib.Type.VEC2);
  expect(node.outputs[0].display_name).toBe("My Name");
  expect(node.outputs[0].name).toBe("my_name");
  expect(node.outputs[0].type).toBe(NodeLib.Type.VEC3);
});

test('node template correctly ignores underscore function', () => {
  let input = `
	void _my_other_func(in vec2 a, in vec2 b, out vec3 my_name) {
		// [...]
	}
	void my_func(in vec2 a, in vec2 b, out vec3 my_name) {
		// [...]
	}
	`;
  let node = new NodeLib.TemplateNode(input);
  expect(node.function_name).toBe("my_func");
});

test('node template correctly errors on two main functions', () => {
  let input = `
	void my_other_func(in vec2 a, in vec2 b, out vec3 my_name) {
		// [...]
	}
	void my_func(in vec2 a, in vec2 b, out vec3 my_name) {
		// [...]
	}
	`;
  expect(() => new NodeLib.TemplateNode(input))
      .toThrow("There can only be one main function per node");
});

test('node template correctly errors on no main function', () => {
  let input = `
	`;
  expect(() => new NodeLib.TemplateNode(input))
      .toThrow("No valid main function was found");
});