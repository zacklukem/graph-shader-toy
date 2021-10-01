import * as React from "react";
import ReactDOM from "react-dom";
import { GraphConnection, GraphNode } from "../../nodelib/src";

import "./NodeEl.scss";
import { Vec2 } from "./util";

let currentConnection: GraphConnection = null;

interface NodeIOProps {
    name: string;
    index: number;
    source: GraphNode;
    onCompleteConnection?: () => void;
    onStartConnection?: (connection: GraphConnection) => void;
}

export class IONode extends React.Component<NodeIOProps> {
    constructor(props: NodeIOProps) {
        super(props);
    }
}

export class NodeInput extends IONode {
    click() {
        this.props.source.inputs[this.props.index] = currentConnection;
        if (this.props.onCompleteConnection) this.props.onCompleteConnection();
        else console.error("Bad output");
    }

    render() {
        return (
            <div className="node-el-io-el node-el-left">
                <span
                    onClick={() => this.click()}
                    className="node-el-dot"
                ></span>
                <span className="node-el-text">{this.props.name}</span>
            </div>
        );
    }
}

export class NodeOutput extends IONode {
    click() {
        currentConnection = {
            param: this.props.index,
            source: this.props.source,
        };
        if (this.props.onStartConnection)
            this.props.onStartConnection(currentConnection);
        else console.error("Bad input");
    }

    render() {
        return (
            <div className="node-el-io-el node-el-right">
                <span
                    className="node-el-dot"
                    onClick={() => this.click()}
                ></span>
                <span className="node-el-text">{this.props.name}</span>
            </div>
        );
    }
}

interface NodeElState {
    pos: { x: number; y: number };
    dragging: boolean;
    lastMouse: { x: number; y: number };
}

interface NodeElProps {
    initialPos: { x: number; y: number };
    title: string;
    index: number;
    onMove: (node: number, pos: Vec2) => void;
}

export const NodeElLeft = (props: React.PropsWithChildren<{}>) => (
    <div className="node-el-io-left">{props.children}</div>
);

export const NodeElRight = (props: React.PropsWithChildren<{}>) => (
    <div className="node-el-io-right">{props.children}</div>
);

export class NodeEl extends React.Component<NodeElProps, NodeElState, any> {
    constructor(props: NodeElProps) {
        super(props);
        this.state = {
            pos: this.props.initialPos,
            dragging: false,
            lastMouse: { x: 0, y: 0 },
        };
    }

    componentDidUpdate(_props: NodeElProps, state: NodeElState) {
        if (this.state.dragging && !state.dragging) {
            document.addEventListener("mousemove", this.onMouseMove.bind(this));
            document.addEventListener("mouseup", this.onMouseUp.bind(this));
        } else if (!this.state.dragging && state.dragging) {
            document.removeEventListener("mousemove", this.onMouseMove);
            document.removeEventListener("mouseup", this.onMouseUp);
        }
    }

    onMouseDown(e: React.MouseEvent) {
        if (e.button !== 0) return;
        this.setState({
            dragging: true,
            lastMouse: {
                x: e.clientX,
                y: e.clientY,
            },
        });
        e.stopPropagation();
        e.preventDefault();
    }

    onMouseUp(e: MouseEvent) {
        this.setState({ dragging: false });
        e.stopPropagation();
        e.preventDefault();
    }

    onMouseMove(e: MouseEvent) {
        if (!this.state.dragging) return;

        let delta_mouse = {
            x: this.state.lastMouse.x - e.clientX,
            y: this.state.lastMouse.y - e.clientY,
        };
        this.setState({
            pos: {
                x: this.state.pos.x - delta_mouse.x, //- this.state.rel.x,
                y: this.state.pos.y - delta_mouse.y, //- this.state.rel.y,
            },
            lastMouse: {
                x: e.clientX,
                y: e.clientY,
            },
        });
        this.props.onMove(this.props.index, this.state.pos);
        e.stopPropagation();
        e.preventDefault();
    }

    render() {
        return (
            <div
                className="node-el"
                style={{
                    left: this.state.pos.x + "px",
                    top: this.state.pos.y + "px",
                }}
            >
                <div
                    className="node-el-header"
                    style={{
                        cursor: this.state.dragging ? "grabbing" : "grab",
                    }}
                    onMouseDown={(e) => this.onMouseDown(e)}
                >
                    <div className="node-el-header-text">
                        {this.props.title}
                    </div>
                </div>
                <div className="node-el-io-list">{this.props.children}</div>
            </div>
        );
    }
}
