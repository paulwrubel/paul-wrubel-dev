import p5Types from "p5";

import { Line } from "./Line";
import { Point } from "./Point";

class BezierCurve {
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

    draw = (p5: p5Types, maxT: number, numSegments?: number) => {
        const lines = this.getApproximationSegments(p5, maxT, numSegments);
        lines.forEach((line) => line.draw(p5));
    };

    drawUsingP5 = (p5: p5Types, maxT: number, numSegments?: number) => {
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
                this.draw(p5, maxT, numSegments);
            }
        }
    };

    getLinesBetweenPoints = (): Line[] => {
        const lines: Line[] = [];
        for (let i = 0; i < this.#points.length - 1; i++) {
            const { x: x1, y: y1 } = this.#points[i];
            const { x: x2, y: y2 } = this.#points[i + 1];
            lines.push(new Line(new Point(x1, y1), new Point(x2, y2)));
        }
        return lines;
    };

    getPointAtDist = (p5: p5Types, dist: number, numSegments = 100): Point => {
        if (dist < 0 || dist > 1) {
            throw new Error("dist must be between 0 and 1 inclusive");
        }
        if (this.order === 1) {
            return this.#points[0].lerp(this.#points[1], dist);
        }
        const segments = this.getApproximationSegments(p5, 1.0, numSegments);
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
    };

    getPointAtT = (p5: p5Types, t: number): Point => {
        if (t < 0 || t > 1) {
            throw new Error("t must be between 0 and 1 inclusive");
        }
        if (this.order === 1) {
            return this.#points[0].lerp(this.#points[1], t);
        }
        return this.getReducedOrderAt(p5, t).getPointAtT(p5, t);
    };

    getReducedOrderAt = (p5: p5Types, t: number): BezierCurve => {
        if (t < 0 || t > 1) {
            throw new Error("t must be between 0 and 1 inclusive");
        }
        const newPoints: Point[] = [];
        const currentPoints = this.points;
        for (let i = 0; i < currentPoints.length - 1; i++) {
            newPoints.push(currentPoints[i].lerp(currentPoints[i + 1], t));
        }
        return new BezierCurve(...newPoints);
    };

    getApproximationSegments = (
        p5: p5Types,
        maxT: number,
        numSegments = 100,
    ): Line[] => {
        if (numSegments < 1) {
            throw new Error("segments must be at least 1");
        }
        const interval = maxT / numSegments;
        const segments: Line[] = [];
        let thisPoint = this.getPointAtT(p5, 0);
        // for (let i = interval; i <= 1; i += interval) {
        for (let i = 0; i < numSegments; i++) {
            const nextT = interval * (i + 1);
            const nextPoint = this.getPointAtT(p5, nextT);
            segments.push(new Line(thisPoint, nextPoint));
            thisPoint = nextPoint;
        }
        return segments;
    };

    copy = () => new BezierCurve(...this.#points.map((p) => p.copy()));

    toString = () =>
        `CubicBezier(${this.points.map((p) => p.toString()).join()})`;
}

export { BezierCurve };
