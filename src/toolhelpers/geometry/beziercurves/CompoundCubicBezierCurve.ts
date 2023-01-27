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
