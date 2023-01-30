import p5Types from "p5";
import Sketch from "react-p5";

const width = 500;
const height = 500;

const TrafficSim = () => {
    const setup = (p5: p5Types, canvasParentRef: Element) => {
        p5.createCanvas(width, height).parent(canvasParentRef);
    };

    const draw = (p5: p5Types) => {
        p5.background(p5.color("#000"));
    };

    return <Sketch setup={setup} draw={draw} />;
};

export default TrafficSim;
