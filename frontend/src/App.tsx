import * as React from "react";
import * as ReactDOM from "react-dom";
import { GraphView } from "./GraphView";
import {
    Graph,
    GraphNode,
    uvSource,
    testNode,
    fragTarget,
} from "../../nodelib/src/index";

class App extends React.Component {
    render() {
        return <GraphView />;
    }
}

let g = new Graph();
let in_uv = new GraphNode([], uvSource());
let test_node = new GraphNode([{ source: in_uv, param: 0 }], testNode());
let out_color = new GraphNode([{ source: test_node, param: 0 }], fragTarget());
in_uv.position = { x: 20, y: 60 };
test_node.position = { x: 420, y: 30 };
out_color.position = { x: 720, y: 80 };
g.addNode(in_uv);
g.addNode(test_node);
g.addNode(out_color);

interface AppContext {
    graph: Graph;
}

export const currentContext = { graph: g };

ReactDOM.render(<App />, document.getElementById("app_attach"));
