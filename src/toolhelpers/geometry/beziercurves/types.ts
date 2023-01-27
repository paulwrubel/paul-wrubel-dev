import p5Types from "p5";

import { Line } from "../Line";
import { Point } from "../Point";
import { Vector } from "../Vector";

interface BezierCurve {
    points: Point[];

    order: number;

    draw(p5: p5Types, maxT: number, numSegments: number, offset?: number): void;

    drawUsingP5(
        p5: p5Types,
        maxT: number,
        numSegments: number,
        offset?: number,
    ): void;

    getLinesBetweenPoints(): Line[];

    getPointAtDist(dist: number, numSegments: number): Point;

    getPointAtT(t: number): Point;

    getApproximationSegments(
        maxT: number,
        numSegments: number,
        offset?: number,
    ): Line[];

    getTangentVectorAtT(t: number): Vector;

    getNormalVectorAtT(t: number): Vector;

    copy(): BezierCurve;

    toString(): string;
}

export type { BezierCurve };
