import { Decimal } from "decimal.js";
import p5Types from "p5";

import { Line } from "../Line";
import { Point } from "../Point";
import { Vector } from "../Vector";

import { ComplexBezierCurve } from "./ComplexBezierCurve";
import {
    BezierCurve,
    DistOutOfBoundsErrorString,
    TOutOfBoundsErrorString,
} from "./types";

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
            if (
                pointsOrCurves.length < 4 ||
                (pointsOrCurves.length - 1) % 3 !== 0
            ) {
                throw new Error(
                    `invalid number of points passed to CompoundCubicBezierCurve: ${pointsOrCurves.length}`,
                );
            }
            this.#curves = [];
            // let currentStartingPoint = points[0];
            for (let i = 0; i < pointsOrCurves.length - 1; i += 3) {
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
        } else {
            throw new Error(
                `invalid type of array element passed to CompoundCubicBezierCurve`,
            );
        }
    }

    get curves(): BezierCurve[] {
        return this.#curves.map((curve) => curve.copy());
    }

    get points(): Point[] {
        return [
            this.#curves[0].points[0],
            ...this.#curves.flatMap((curve) => curve.points.slice(1)),
        ];
    }

    get order(): number {
        return 3;
    }

    get curveCount(): number {
        return this.#curves.length;
    }

    length(numSegments: number): number {
        return this.getApproximationSegments(1.0, numSegments).reduce(
            (acc, segment) => acc + segment.length,
            0,
        );
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
        this.draw(p5, maxT, numSegments, offset);
    }

    getLinesBetweenPoints(): Line[] {
        return this.#curves.flatMap((curve) => curve.getLinesBetweenPoints());
    }

    getPointAtDist(dist: number, numSegments: number): Point {
        if (dist < 0 || dist > 1) {
            throw new Error(DistOutOfBoundsErrorString);
        }
        const segments = this.getApproximationSegments(1.0, numSegments);
        const totalDistance = this.length(numSegments);
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
        return this.#curves.at(-1)?.points.at(-1) as Point;
    }

    getIndexAndTranslatedTFromT(t: number): {
        index: number;
        translatedT: number;
    } {
        if (t < 0 || t > 1) {
            throw new Error(TOutOfBoundsErrorString);
        }
        if (t === 1) {
            return { index: this.#curves.length - 1, translatedT: 1 };
        }
        const decimalT = new Decimal(t);
        const interval = Decimal.div(1, this.#curves.length);
        const index = decimalT.dividedToIntegerBy(interval);
        const translatedT = decimalT.mod(interval).times(this.#curves.length);

        return {
            index: +index,
            translatedT: +translatedT,
        };
    }

    getPointAtT(t: number): Point {
        if (t < 0 || t > 1) {
            throw new Error(TOutOfBoundsErrorString);
        }
        const { index, translatedT } = this.getIndexAndTranslatedTFromT(t);
        // console.log(`index: ${index}, tt: ${translatedT}`);

        // if (t === 1) {
        //     return this.#curves.at(-1)?.points.at(-1) as Point;
        // }

        // const decimalT = new Decimal(t);
        // const interval = Decimal.div(1, length);
        // const index = decimalT.dividedToIntegerBy(interval);
        // const translatedT = decimalT.mod(interval).times(length);

        return this.#curves[index].getPointAtT(translatedT);
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
                : prePoint.add(this.getNormalVectorAtT(0).multipliedBy(offset));
        // for (let i = interval; i <= 1; i += interval) {
        for (let i = 0; i < numSegments; i++) {
            const nextT = interval * (i + 1);
            const nextPrePoint = this.getPointAtT(nextT);
            const nextPoint =
                offset === 0
                    ? nextPrePoint
                    : nextPrePoint.add(
                          this.getNormalVectorAtT(nextT).multipliedBy(offset),
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
        const { index, translatedT } = this.getIndexAndTranslatedTFromT(t);
        return this.#curves[index].getTangentVectorAtT(translatedT);
    }

    getNormalVectorAtT(t: number): Vector {
        return this.getTangentVectorAtT(t).rotatedByRadians(Math.PI / 2);
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
