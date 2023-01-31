import p5Types from "p5";
import Sketch from "react-p5";

import { Line } from "toolhelpers/geometry/Line";
// import { Point } from "toolhelpers/geometry/Point";
// import { Vector } from "toolhelpers/geometry/Vector";

// import { Arm } from "./Arm";
import { Pendulum } from "./Pendulum";

// import { Arm } from "./types";

// const width = 500;
// const height = 500;

// const gravity = new Vector(0, 1);
// const center = new Point(width / 2, height / 2);

const timeScalar = 1 / 80;
// const substepCount = 50;

// const previousPointsFrame: Point[] = [];
// const previousPoints: Point[] = [];
// const points: Point[] = [];
// const velocities: Vector[] = [];

const traces: Line[] = [];
const traceLimit = 500;

type PendulumProps = {
    width: number;
    height: number;
    pendulum: Pendulum;
};

const PendulumSketch = ({ width, height, pendulum }: PendulumProps) => {
    const setup = (p5: p5Types, canvasParentRef: Element) => {
        p5.createCanvas(width, height).parent(canvasParentRef);
    };

    const draw = (p5: p5Types) => {
        const deltaTime = (p5.deltaTime > 0 ? p5.deltaTime : 1) * timeScalar;

        // update pendulum
        pendulum.update(deltaTime);

        // gather traces
        traces.push(pendulum.traceLine());
        if (traces.length > traceLimit) {
            traces.shift();
        }

        // draw background
        p5.background(p5.color("#000"));

        // draw center point
        p5.push();
        const white = p5.color("#FFF");
        p5.stroke(white);
        p5.fill(white);
        pendulum.origin.drawAsCircle(p5, 5);
        p5.pop();

        // draw arms
        p5.push();
        p5.stroke(p5.color("#FFF"));
        pendulum.drawArms(p5);
        p5.pop();

        // draw points
        p5.push();
        p5.stroke(p5.color("#FFF"));
        pendulum.drawPoints(p5);
        p5.pop();

        // draw traces
        for (let i = 0; i < traces.length; i++) {
            p5.push();
            p5.stroke(p5.color("#0FF"));
            traces[i].draw(p5);
            p5.pop();
        }
    };

    return <Sketch setup={setup} draw={draw} />;
};

export default PendulumSketch;
