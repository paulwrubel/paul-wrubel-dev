import { BezierCurve } from "./BezierCurve";
import { Point } from "./Point";

const isPointArray = (
    pointsOrCurves: (Point | BezierCurve)[],
): pointsOrCurves is Point[] => {
    return pointsOrCurves.every((poc) => poc instanceof Point);
};

const isBezierCurveArray = (
    pointsOrCurves: (Point | BezierCurve)[],
): pointsOrCurves is BezierCurve[] => {
    return pointsOrCurves.every((poc) => poc instanceof BezierCurve);
};

class CompoundCubicBezierCurve {
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
                    new BezierCurve(...pointsOrCurves.slice(i, i + 4)),
                );
            }
        } else if (isBezierCurveArray(pointsOrCurves)) {
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

    copy = () =>
        new CompoundCubicBezierCurve(...this.#curves.map((c) => c.copy()));

    toString = () =>
        `CompoundCubicBezierCurve(${this.#curves
            .map((c) => c.toString())
            .join()})`;
}

export { CompoundCubicBezierCurve };
