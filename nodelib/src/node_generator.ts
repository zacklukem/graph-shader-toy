export class InvalidNodeSyntaxError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export enum Type {
  FLOAT = "float",
  INT = "int",
  VEC2 = "vec2",
  VEC3 = "vec3",
  VEC4 = "vec4",
}

function snakeToDisplay(ident: string): string {
  return ident
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export interface Parameter {
  name: string;
  display_name: string;
  type: Type;
}

export interface NodeGenerator {
  readonly inputs: Parameter[];
  readonly outputs: Parameter[];
  readonly display_name: string;
  genDefinitions(): string;
  genVariableDecl(instance: number): string;
  genCall(instance: number, params: string[]): string;
  getOutput(i: number, instance: number): string;
}

export class SourceNode implements NodeGenerator {
  readonly inputs: Parameter[] = [];
  readonly outputs: Parameter[];
  readonly display_name: string;

  constructor(display_name: string, outputs: Parameter[]) {
    this.outputs = outputs;
    this.display_name = display_name;
  }
  genDefinitions() {
    return "";
  }
  genVariableDecl(_: number) {
    return "";
  }
  genCall(_0: number, _1: string[]) {
    return "";
  }
  getOutput(i: number, _: number): string {
    return this.outputs[i].name;
  }
}

export class TargetNode implements NodeGenerator {
  readonly inputs: Parameter[];
  readonly outputs: Parameter[] = [];
  readonly display_name: string;

  constructor(display_name: string, inputs: Parameter[]) {
    this.inputs = inputs;
    this.display_name = display_name;
  }

  genDefinitions() {
    return "";
  }
  genVariableDecl(_: number) {
    return "";
  }
  genCall(_: number, inputs: string[]) {
    return inputs
      .map((input, i) => `  ${this.inputs[i].name} = ${input};`)
      .join("\n");
  }
  getOutput(_0: number, _1: number): string {
    return "";
  }
}

export class TemplateNode implements NodeGenerator {
  // From NodeGenerator
  readonly inputs: Parameter[] = [];
  readonly outputs: Parameter[] = [];
  readonly display_name: string;

  readonly function_name: string;
  readonly code: string;

  /**
   * Creates a new node with the given source string representing the node name.
   * The source string will contain a single function declaration with a void
   * return type and parameters with in or out qualifiers.  The input may start
   * with a comment with syntax `//@` followed by the display name which will be
   * trimmed. Otherwise, the display name is the function name where underscores
   * are replaced with spaces, and all words are capitalized.
   *
   * The node's main function cannot be preceded by an `_`.  Any function
   * preceded by an `_` is not considered a main function.  There can only be
   * one main function.
   *
   * ```glsl
   * //@ Display Name
   * void function_name(in vec2 a, out vec2 b) {
   *     // ...
   * }
   * ```
   */
  public constructor(source: string) {
    let display_match = source.matchAll(/^\s*\/\/@\s*([^\n]*)/g).next();
    if (display_match.value) this.display_name = display_match.value[1];

    // Matches a function declaration with every parameter preceded by either in
    // or out
    let functions_iter = source.matchAll(
      /void\s+(?<func_name>(?:[A-Za-z])\w*)\s*\((?<params>(?:(?:in|out)\s+\w+\s+\w+,?\s*)*)\)/g
    );
    let func = functions_iter.next().value;

    if (!func)
      throw new InvalidNodeSyntaxError("No valid main function was found");

    if (functions_iter.next().value)
      throw new InvalidNodeSyntaxError(
        "There can only be one main function per node"
      );

    this.function_name = func.groups.func_name;

    if (!this.display_name)
      this.display_name = snakeToDisplay(this.function_name);

    let params = func.groups.params.matchAll(
      /(?<dir>in|out)\s+(?<ty>\w+)\s+(?<ident>\w+)/g
    );

    for (let param of params) {
      let target = param.groups.dir === "in" ? this.inputs : this.outputs;
      target.push({
        name: param.groups.ident,
        display_name: snakeToDisplay(param.groups.ident),
        type: param.groups.ty,
      });
    }

    this.code = source;
  }

  genDefinitions() {
    return this.code;
  }
  genVariableDecl(instance: number) {
    return (
      this.outputs
        .map((output) => `  ${output.type} ${output.name}_${instance};`)
        .join("\n") + "\n"
    );
  }

  genCall(instance: number, inputs: string[]) {
    let params = inputs.concat(
      this.outputs.map((output) => `${output.name}_${instance}`)
    );
    return `  ${this.function_name}(${params.join(", ")});\n`;
  }

  getOutput(i: number, instance: number): string {
    return `${this.outputs[i].name}_${instance}`;
  }
}
