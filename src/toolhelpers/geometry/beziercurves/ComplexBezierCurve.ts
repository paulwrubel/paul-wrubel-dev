import p5Types from "p5";

import { Line } from "../Line";
import { Point } from "../Point";
import { Vector } from "../Vector";

import { BezierCurve } from "./types";

const TOutOfBoundsErrorString = "t must be between 0 and 1 inclusive";
const DistOutOfBoundsErrorString = "dist must be between 0 and 1 inclusive";

class ComplexBezierCurve implements BezierCurve {
    #points: Point[];

    // start, anchor1, anchor2, ...,  end
    constructor(...points: Point[]) {
        if (points.length < 2) {
            throw new Error("must supply at least 2 points to BezierCurve");
        }
        this.#points = points.slice();
    }

    get points() {
        return this.#points.slice();
    }

    get order() {
        return this.#points.length - 1;
    }

    draw(p5: p5Types, maxT: number, numSegments: number, offset?: number) {
        const lines = this.getApproximationSegments(maxT, numSegments, offset);
        lines.forEach((line) => line.draw(p5));
    }

    drawUsingP5(
        p5: p5Types,
        maxT: number,
        numSegments: number,
        offset?: number,
    ) {
        switch (this.order) {
            case 1: {
                // linear
                p5.line(
                    this.#points[0].x,
                    this.#points[0].y,
                    this.#points[1].x,
                    this.#points[1].y,
                );
                break;
            }
            case 2: {
                // quadratic
                p5.beginShape();
                p5.vertex(this.#points[0].x, this.#points[0].y);
                p5.quadraticVertex(
                    this.#points[1].x,
                    this.#points[1].y,
                    this.#points[2].x,
                    this.#points[2].y,
                );
                p5.endShape();
                break;
            }
            case 3: {
                // cubic
                p5.bezier(
                    this.#points[0].x,
                    this.#points[0].y,
                    this.#points[1].x,
                    this.#points[1].y,
                    this.#points[2].x,
                    this.#points[2].y,
                    this.#points[3].x,
                    this.#points[3].y,
                );
                break;
            }
            default: {
                this.draw(p5, maxT, numSegments, offset);
            }
        }
    }

    getLinesBetweenPoints(): Line[] {
        const lines: Line[] = [];
        for (let i = 0; i < this.#points.length - 1; i++) {
            const { x: x1, y: y1 } = this.#points[i];
            const { x: x2, y: y2 } = this.#points[i + 1];
            lines.push(new Line(new Point(x1, y1), new Point(x2, y2)));
        }
        return lines;
    }

    getPointAtDist(dist: number, numSegments: number): Point {
        if (dist < 0 || dist > 1) {
            throw new Error(DistOutOfBoundsErrorString);
        }
        if (this.order === 1) {
            return this.#points[0].lerp(this.#points[1], dist);
        }
        const segments = this.getApproximationSegments(1.0, numSegments);
        const totalDistance = segments.reduce(
            (acc, segment) => acc + segment.length,
            0,
        );
        const targetDist = totalDistance * dist;
        let accumulatedDistance = 0;
        for (let i = 0; i < segments.length; i++) {
            const newAccumulatedDistance =
                accumulatedDistance + segments[i].length;
            if (newAccumulatedDistance > targetDist) {
                return segments[i].pointAlong(
                    (targetDist - accumulatedDistance) / segments[i].length,
                );
            }
            accumulatedDistance += segments[i].length;
        }
        return this.#points[this.#points.length - 1];
    }

    getPointAtT(t: number): Point {
        if (t < 0 || t > 1) {
            throw new Error(TOutOfBoundsErrorString);
        }
        if (this.order === 1) {
            return this.#points[0].lerp(this.#points[1], t);
        }
        return this.getReducedOrderAt(t).getPointAtT(t);
    }

    getReducedOrderAt(t: number): ComplexBezierCurve {
        if (t < 0 || t > 1) {
            throw new Error(TOutOfBoundsErrorString);
        }
        const newPoints: Point[] = [];
        const currentPoints = this.points;
        for (let i = 0; i < currentPoints.length - 1; i++) {
            newPoints.push(currentPoints[i].lerp(currentPoints[i + 1], t));
        }
        return new ComplexBezierCurve(...newPoints);
    }

    getApproximationSegments(
        maxT: number,
        numSegments: number,
        offset = 0,
    ): Line[] {
        if (numSegments < 1) {
            throw new Error("segments must be at least 1");
        }
        const interval = maxT / numSegments;
        const segments: Line[] = [];
        const prePoint = this.getPointAtT(0);
        let thisPoint =
            offset === 0
                ? prePoint
                : prePoint.add(this.getNormalVectorAtT(0).mult(offset));
        // for (let i = interval; i <= 1; i += interval) {
        for (let i = 0; i < numSegments; i++) {
            const nextT = interval * (i + 1);
            const nextPrePoint = this.getPointAtT(nextT);
            const nextPoint =
                offset === 0
                    ? nextPrePoint
                    : nextPrePoint.add(
                          this.getNormalVectorAtT(nextT).mult(offset),
                      );
            segments.push(new Line(thisPoint, nextPoint));
            thisPoint = nextPoint;
        }
        return segments;
    }

    getTangentVectorAtT(t: number): Vector {
        if (t < 0 || t > 1) {
            throw new Error(TOutOfBoundsErrorString);
        }
        if (this.order === 1) {
            return this.#points[0].to(this.#points[1]).unit();
        }
        return this.getReducedOrderAt(t).getTangentVectorAtT(t);
    }

    getNormalVectorAtT(t: number): Vector {
        return this.getTangentVectorAtT(t).rotate(Math.PI / 2);
    }

    copy(): ComplexBezierCurve {
        return new ComplexBezierCurve(...this.#points.map((p) => p.copy()));
    }

    toString(): string {
        return `BezierCurve(${this.points.map((p) => p.toString()).join()})`;
    }
}

export { ComplexBezierCurve };
