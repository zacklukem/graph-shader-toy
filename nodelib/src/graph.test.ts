import { fragTarget, testNode, uvSource } from "./basic_nodes";
import { Graph, GraphNode } from "./graph";

test("hi", () => {
  let g = new Graph();
  let in_uv = new GraphNode([], uvSource());
  let test_node = new GraphNode([{ source: in_uv, param: 0 }], testNode());
  let out_color = new GraphNode(
    [{ source: test_node, param: 0 }],
    fragTarget()
  );
  g.addNode(in_uv);
  g.addNode(test_node);
  g.addNode(out_color);
  console.log(g.generate());
});
