import p5Types from "p5";
import Sketch from "react-p5";

type Location = {
    x: number;
    y: number;
};

type Node = {
    location: Location;
    inlets: {
        north: number;
        south: number;
        east: number;
        west: number;
    };
    outlets: {
        north: number;
        south: number;
        east: number;
        west: number;
    };
};

type Road = {
    nodes: {
        a: Node;
        b: Node;
    };
};

type Vehicle = {
    road: string;
    position: {
        from: Node;
        to: Node;
        progress: number;
    };
    speed: number;
};

const width = 500;
const height = 500;

const TrafficSim = () => {
    const setup = (p5: p5Types, canvasParentRef: Element) => {
        p5.createCanvas(width, height).parent(canvasParentRef);
    };

    const draw = (p5: p5Types) => {
        // draw the background
        p5.background(p5.color("#DDD"));
    };

    return <Sketch setup={setup} draw={draw} />;
};

export default TrafficSim;
