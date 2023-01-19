import p5Types from "p5";

type Point = {
    x: number;
    y: number;
};

type Line = {
    a: Point;
    b: Point;
};

const printPoint = ({ x, y }: Point) => `(${x},${y})`;

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

    draw = (p5: p5Types, numSegments?: number) => {
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
                this.drawApproximation(p5, numSegments);
            }
        }
    };

    drawApproximation = (p5: p5Types, numSegments?: number) => {
        const lines = this.getApproximationSegments(p5, numSegments);
        lines.forEach((line) => {
            p5.line(line.a.x, line.a.y, line.b.x, line.b.y);
        });
    };

    getLinesBetweenPoints = (): Line[] => {
        const lines: Line[] = [];
        for (let i = 0; i < this.#points.length - 1; i++) {
            const { x: x1, y: y1 } = this.#points[i];
            const { x: x2, y: y2 } = this.#points[i + 1];
            lines.push({
                a: { x: x1, y: y1 },
                b: { x: x2, y: y2 },
            });
        }
        return lines;
    };

    getPointAt = (p5: p5Types, t: number): Point => {
        if (t < 0 || t > 1) {
            throw new Error("t must be between 0 and 1 inclusive");
        }
        if (this.order === 1) {
            const thisVector = p5.createVector(
                this.#points[0].x,
                this.#points[0].y,
            );
            const nextVector = p5.createVector(
                this.#points[1].x,
                this.#points[1].y,
            );
            const tVector = thisVector.lerp(nextVector, t);
            return { x: tVector.x, y: tVector.y };
        }
        return this.getReducedOrderAt(p5, t).getPointAt(p5, t);
    };

    getReducedOrderAt = (p5: p5Types, t: number): BezierCurve => {
        if (t < 0 || t > 1) {
            throw new Error("t must be between 0 and 1 inclusive");
        }
        const newPoints: Point[] = [];
        const currentPoints = this.points;
        for (let i = 0; i < currentPoints.length - 1; i++) {
            const thisVector = p5.createVector(
                currentPoints[i].x,
                currentPoints[i].y,
            );
            const nextVector = p5.createVector(
                currentPoints[i + 1].x,
                currentPoints[i + 1].y,
            );
            const tVector = thisVector.lerp(nextVector, t);
            newPoints.push({ x: tVector.x, y: tVector.y });
        }
        return new BezierCurve(...newPoints);
    };

    getApproximationSegments = (p5: p5Types, numSegments = 10): Line[] => {
        if (numSegments < 1) {
            throw new Error("segments must be at least 1");
        }
        const interval = 1 / numSegments;
        const segments: Line[] = [];
        let thisPoint = this.getPointAt(p5, 0);
        // for (let i = interval; i <= 1; i += interval) {
        for (let i = 0; i < numSegments; i++) {
            const nextT = interval * (i + 1);
            const nextPoint = this.getPointAt(p5, nextT);
            segments.push({
                a: { x: thisPoint.x, y: thisPoint.y },
                b: { x: nextPoint.x, y: nextPoint.y },
            });
            thisPoint = { x: nextPoint.x, y: nextPoint.y };
        }
        return segments;
    };

    toString = () => `CubicBezier(${this.points.map(printPoint).join()})`;
}

export { BezierCurve, type Point };
