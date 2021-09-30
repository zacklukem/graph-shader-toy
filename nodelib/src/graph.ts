import { NodeGenerator, TargetNode } from "./node_generator";

let global_uid = 0;

export class Graph {
  private nodes: GraphNode[] = [];

  public addNode(node: GraphNode) {
    this.nodes.push(node);
  }

  public generate(): string {
    // TODO: check if there are circular nodes
    let out = "";
    out += this.nodes
      .map((node) => node.generator.genDefinitions())
      .join("\n\n");
    out += "void main() {\n";
    out += this.nodes
      .map((node) => node.generator.genVariableDecl(node.instance))
      .join("");

    let target = this.nodes.find(
      (node) => node.generator instanceof TargetNode
    );
    if (!target) throw new Error("Must have a target node");
    out += target.generate();

    out += "\n}\n";
    return out;
  }
}

export interface GraphConnection {
  source: GraphNode;
  param: number;
}

export class GraphNode {
  readonly instance: number;
  inputs: GraphConnection[];
  generator: NodeGenerator;
  constructor(connections: GraphConnection[], generator: NodeGenerator) {
    this.inputs = connections;
    this.generator = generator;
    this.instance = global_uid++;
  }

  generate(): string {
    let out = "";
    for (let input of this.inputs) {
      out += input.source.generate();
    }
    let inputs = this.inputs.map((input) =>
      input.source.generator.getOutput(input.param, input.source.instance)
    );
    out += this.generator.genCall(this.instance, inputs);
    return out;
  }
}
