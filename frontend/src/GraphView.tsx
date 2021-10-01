import "./GraphView.scss";

import { ConnectionCanvas } from "./ConnectionCanvas";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {
    NodeEl,
    NodeElLeft,
    NodeElRight,
    NodeInput,
    NodeOutput,
} from "./NodeEl";
import { currentContext } from "./App";
import * as NodeLib from "../../nodelib/src/index";
import { Vec2 } from "./util";

interface GraphViewState {
    width: number;
    height: number;
    graph: NodeLib.Graph;
    currentConnection: NodeLib.GraphConnection;
}

export class GraphView extends React.Component<{}, GraphViewState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            width: 0,
            height: 0,
            graph: currentContext.graph,
            currentConnection: null,
        };
    }

    componentDidUpdate() {
        console.log(this.state);
    }

    componentDidMount() {
        let component = ReactDOM.findDOMNode(this) as Element;
        this.setState({
            width: component.getBoundingClientRect().width,
            height: component.getBoundingClientRect().height,
        });
    }

    moveNode(node: number, pos: Vec2) {
        this.state.graph.nodes[node].position = pos;
        this.setState({
            graph: this.state.graph,
        });
    }

    onStartConnection(connection: NodeLib.GraphConnection) {
        this.setState({
            graph: this.state.graph,
            currentConnection: connection,
        });
    }

    onCompleteConnection() {
        this.setState({
            graph: this.state.graph,
            currentConnection: null,
        });
    }

    public render() {
        return (
            <div className="graph-view">
                <ConnectionCanvas
                    graph={this.state.graph}
                    width={this.state.width}
                    height={this.state.height}
                    currentConnection={this.state.currentConnection}
                />
                {this.state.graph.nodes.map((node, index) => (
                    <NodeEl
                        key={node.instance}
                        onMove={(node, pos) => this.moveNode(node, pos)}
                        index={index}
                        initialPos={node.position}
                        title={node.generator.display_name}
                    >
                        <NodeElLeft>
                            {node.generator.inputs.map((input, index) => (
                                <NodeInput
                                    // OK to use index as key here because it is
                                    // a permanent value
                                    key={index}
                                    name={input.display_name}
                                    index={index}
                                    source={node}
                                    onCompleteConnection={() =>
                                        this.onCompleteConnection()
                                    }
                                />
                            ))}
                        </NodeElLeft>
                        <NodeElRight>
                            {node.generator.outputs.map((output, index) => (
                                <NodeOutput
                                    key={index}
                                    name={output.display_name}
                                    index={index}
                                    source={node}
                                    onStartConnection={(c) =>
                                        this.onStartConnection(c)
                                    }
                                />
                            ))}
                        </NodeElRight>
                    </NodeEl>
                ))}
            </div>
        );
    }
}
