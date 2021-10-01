import { SourceNode, TargetNode, TemplateNode, Type } from "./node_generator";

let frag_target: TargetNode;
let test_node: TemplateNode;
let uv_source: SourceNode;

export function fragTarget() {
    if (!frag_target)
        frag_target = new TargetNode("Fragment", [
            { name: "_output_color", display_name: "Color", type: Type.VEC4 },
        ]);
    return frag_target;
}

export function testNode() {
    if (!test_node)
        test_node =
            new TemplateNode(`void test_node(in vec4 in_color, in vec4 unused, out vec4 out_color) {
  out_color = -in_color;
}`);
    return test_node;
}

export function uvSource() {
    if (!uv_source)
        uv_source = new SourceNode("UV", [
            { name: "_in_uv", display_name: "uv", type: Type.VEC4 },
        ]);
    return uv_source;
}
