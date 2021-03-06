import * as React from "react";
import { Vec2 } from "./util";
import { Graph, GraphNode, GraphConnection } from "../../nodelib/src/graph";

const HEADER_HEIGHT = 30;
const HEADER_MARGIN = 5;
const IO_HEIGHT = 20;
const NODE_WIDTH = 180;

function calculateDotPos(node: GraphNode, param: number, input: boolean): Vec2 {
    let out = {
        x: node.position.x,
        y: node.position.y + HEADER_HEIGHT + HEADER_MARGIN,
    };
    if (!input) out.x += NODE_WIDTH;
    out.y += IO_HEIGHT * param + IO_HEIGHT / 2;
    return out;
}

interface ConnectionCanvasProps {
    width: number;
    height: number;
    graph: Graph;
    currentConnection: GraphConnection;
}

interface ConnectionCanvasState {
    mouse: Vec2;
}

export class ConnectionCanvas extends React.Component<
    ConnectionCanvasProps,
    ConnectionCanvasState
> {
    private ctx: CanvasRenderingContext2D;

    constructor(props: ConnectionCanvasProps) {
        super(props);
        this.state = {
            mouse: { x: 0, y: 0 },
        };
    }

    componentDidMount() {
        var c = document.getElementById(
            "connection-canvas"
        ) as HTMLCanvasElement;
        this.ctx = c.getContext("2d");
    }

    componentDidUpdate(prevProps: ConnectionCanvasProps) {
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = "#888";
        this.ctx.clearRect(0, 0, this.props.width, this.props.height);
        for (let node of this.props.graph.nodes) {
            for (let [i, input] of node.inputs.entries()) {
                if (input) {
                    let end = calculateDotPos(node, i, true);
                    let start = calculateDotPos(
                        input.source,
                        input.param,
                        false
                    );
                    this.bezier(start, end);
                }
            }
        }
        if (
            this.props.currentConnection != null &&
            this.props.currentConnection == prevProps.currentConnection
        ) {
            this.bezier(
                calculateDotPos(
                    this.props.currentConnection.source,
                    this.props.currentConnection.param,
                    false
                ),
                this.state.mouse
            );
        }
    }

    private bezier(start: Vec2, end: Vec2) {
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y + this.ctx.lineWidth / 2);
        let curve = Math.abs(start.x - end.x) / 2;
        this.ctx.bezierCurveTo(
            start.x + curve,
            start.y,
            end.x - curve,
            end.y,
            end.x,
            end.y + this.ctx.lineWidth / 2
        );
        this.ctx.stroke();
    }

    mouseMove(e: React.MouseEvent) {
        if (this.props.currentConnection) {
            this.setState({
                mouse: { x: e.clientX, y: e.clientY },
            });
        }
    }

    render() {
        return (
            <canvas
                width={this.props.width}
                height={this.props.height}
                id="connection-canvas"
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    border: "none",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                }}
                onMouseMove={(e) => this.mouseMove(e)}
            ></canvas>
        );
    }
}
