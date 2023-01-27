import p5Types from "p5";

import { Line } from "../Line";
import { Point } from "../Point";

import { ComplexBezierCurve } from "./ComplexBezierCurve";
import { BezierCurve } from "./types";

const isPointArray = (
    pointsOrCurves: (Point | BezierCurve)[],
): pointsOrCurves is Point[] => {
    return pointsOrCurves.every((poc) => poc instanceof Point);
};

const isComplexBezierCurveArray = (
    pointsOrCurves: (Point | BezierCurve)[],
): pointsOrCurves is BezierCurve[] => {
    return pointsOrCurves.every((poc) => poc instanceof ComplexBezierCurve);
};

class CompoundCubicBezierCurve implements BezierCurve {
    #curves: BezierCurve[];

    constructor(...pointsOrCurves: (Point | BezierCurve)[]) {
        if (isPointArray(pointsOrCurves)) {
            if ((pointsOrCurves.length - 1) % 3 !== 0) {
                throw new Error(
                    `invalid number of points passed to CompoundCubicBezierCurve: ${pointsOrCurves.length}`,
                );
            }
            this.#curves = [];
            // let currentStartingPoint = points[0];
            for (let i = 0; i < pointsOrCurves.length; i += 3) {
                this.#curves.push(
                    new ComplexBezierCurve(...pointsOrCurves.slice(i, i + 4)),
                );
            }
        } else if (isComplexBezierCurveArray(pointsOrCurves)) {
            if (pointsOrCurves.some((curve) => curve.order !== 3)) {
                throw new Error(
                    `invalid order in some curve passed to CompoundCubicBezierCurve`,
                );
            }
            this.#curves = pointsOrCurves.slice();
        }
        throw new Error(
            `invalid type of array element passed to CompoundCubicBezierCurve`,
        );
    }

    get points(): Point[] {
        return this.#curves.flatMap((curve) => curve.points);
    }

    get order(): number {
        return 3;
    }

    draw(
        p5: p5Types,
        maxT: number,
        numSegments: number,
        offset?: number | undefined,
    ) {
        const perCurveSegments = Math.ceil(numSegments / this.#curves.length);
        this.#curves.forEach((curve) =>
            curve.draw(p5, maxT, perCurveSegments, offset),
        );
    }

    drawUsingP5(
        p5: p5Types,
        maxT: number,
        numSegments: number,
        offset?: number | undefined,
    ) {
        const perCurveSegments = Math.ceil(numSegments / this.#curves.length);
        this.#curves.forEach((curve) =>
            curve.drawUsingP5(p5, maxT, perCurveSegments, offset),
        );
    }

    getLinesBetweenPoints(): Line[] {
        return this.#curves.flatMap((curve) => curve.getLinesBetweenPoints());
    }

    getPointAtDist(dist: number, numSegments: number): Point {
        // TODO
    }

    getPointAtT(t: number): Point {
        // TODO
    }

    getApproximationSegments(
        maxT: number,
        numSegments: number,
        offset?: number | undefined,
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

        const perCurveSegments = Math.ceil(numSegments / this.#curves.length);
        return this.#curves.flatMap((curve) =>
            curve.getApproximationSegments(maxT, perCurveSegments, offset),
        );
    }

    copy(): CompoundCubicBezierCurve {
        return new CompoundCubicBezierCurve(
            ...this.#curves.map((c) => c.copy()),
        );
    }

    toString(): string {
        return `CompoundCubicBezierCurve(${this.#curves
            .map((c) => c.toString())
            .join()})`;
    }
}

export { CompoundCubicBezierCurve };
