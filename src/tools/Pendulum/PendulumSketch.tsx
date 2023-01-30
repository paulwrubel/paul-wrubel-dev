import p5Types from "p5";
import Sketch from "react-p5";

import { Line } from "toolhelpers/geometry/Line";
import { Point } from "toolhelpers/geometry/Point";
import { Vector } from "toolhelpers/geometry/Vector";

import { Arm } from "./types";

const width = 500;
const height = 500;

const gravity = new Vector(0, 1);
const center = new Point(width / 2, height / 2);

const timeScalar = 1 / 80;
const substepCount = 50;

const previousPointsFrame: Point[] = [];
const previousPoints: Point[] = [];
const points: Point[] = [];
const velocities: Vector[] = [];

const traces: Line[] = [];
const traceLimit = 100;

type PendulumProps = {
    arms: Arm[];
};

const PendulumSketch = ({ arms }: PendulumProps) => {
    const updateForcesAndPositions = (deltaTime: number) => {
        for (let i = 0; i < points.length; i++) {
            const velocity = velocities[i].addedTo(
                gravity.multipliedBy(deltaTime),
            );
            previousPoints[i] = points[i];
            points[i] = points[i].add(velocity.multipliedBy(deltaTime));
        }
    };

    const applyConstraints = () => {
        for (let i = 0; i < points.length; i++) {
            const previousPoint = i === 0 ? center : points[i - 1];
            const requiredLength = arms[i].length;
            const currentLength = previousPoint.to(points[i]).magnitude;
            const lengthScalar = currentLength - requiredLength;

            const unitToCurrent = previousPoint.to(points[i]).unit();

            const inverseMassCurrent = 1 / arms[i].weight;
            const inverseMassPrevious = i === 0 ? 0 : 1 / arms[i - 1].weight;

            if (i > 0) {
                const massScalarPrevious =
                    inverseMassPrevious /
                    (inverseMassCurrent + inverseMassPrevious);
                const previousDelta = unitToCurrent.multipliedBy(
                    lengthScalar * massScalarPrevious,
                );
                points[i - 1] = points[i - 1].add(previousDelta);
            }

            const massScalarCurrent =
                inverseMassCurrent / (inverseMassCurrent + inverseMassPrevious);
            const currentDelta = unitToCurrent.multipliedBy(
                -1 * lengthScalar * massScalarCurrent,
            );
            points[i] = points[i].add(currentDelta);
        }
    };

    const updateVelocities = (deltaTime: number) => {
        for (let i = 0; i < points.length; i++) {
            velocities[i] = previousPoints[i]
                .to(points[i])
                .dividedBy(deltaTime);
        }
    };

    const setup = (p5: p5Types, canvasParentRef: Element) => {
        p5.createCanvas(width, height).parent(canvasParentRef);

        for (let i = 0; i < arms.length; i++) {
            const arm = arms[i];
            const startingPoint = i === 0 ? center : (points.at(-1) as Point);
            const point = startingPoint.add(
                gravity
                    .withMagnitude(arm.length)
                    .rotatedByDegrees(arm.initialAngle),
            );
            previousPointsFrame.push(point.copy());
            previousPoints.push(point.copy());
            points.push(point.copy());
            velocities.push(Vector.Zero);
        }
    };

    const draw = (p5: p5Types) => {
        const deltaTime =
            ((p5.deltaTime > 0 ? p5.deltaTime : 1) * timeScalar) / substepCount;

        // perform physics updates
        for (let i = 0; i < points.length; i++) {
            previousPointsFrame[i] = points[i];
        }
        for (let i = 0; i < substepCount; i++) {
            updateForcesAndPositions(deltaTime);
            applyConstraints();
            updateVelocities(deltaTime);
        }
        traces.push(
            previousPointsFrame[previousPointsFrame.length - 1].lineTo(
                points[points.length - 1],
            ),
        );
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
        center.drawAsCircle(p5, 5);
        p5.pop();

        // draw arms
        for (let i = 0; i < points.length; i++) {
            const start = i === 0 ? center : points[i - 1];

            p5.push();
            p5.stroke(p5.color("#FFF"));
            start.lineTo(points[i]).draw(p5);
            p5.pop();
        }

        // draw points
        for (let i = 0; i < points.length; i++) {
            p5.push();
            p5.stroke(p5.color("#FFF"));
            points[i].drawAsCircle(
                p5,
                Math.sqrt((arms[i].weight * 20) / Math.PI),
            );
            p5.pop();
        }

        // draw traces
        for (let i = 0; i < traces.length; i++) {
            p5.push();
            p5.stroke(p5.color("#F00"));
            traces[i].draw(p5);
            p5.pop();
        }
    };

    return <Sketch setup={setup} draw={draw} />;
};

export default PendulumSketch;
