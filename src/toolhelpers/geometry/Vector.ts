import p5Types from "p5";

import { Point } from "./Point";
class Vector {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static get Zero() {
        return new Vector(0, 0);
    }

    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    drawFrom(p5: p5Types, p: Point) {
        p5.line(p.x, p.y, p.x + this.x, p.y + this.y);
    }

    addedTo(v: Vector): Vector {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    subtractedBy(v: Vector): Vector {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    multipliedBy(s: number): Vector {
        return new Vector(this.x * s, this.y * s);
    }

    dividedBy(s: number): Vector {
        return new Vector(this.x / s, this.y / s);
    }

    unit(): Vector {
        return this.dividedBy(this.magnitude);
    }

    withMagnitude(m: number): Vector {
        return this.multipliedBy(m / this.magnitude);
    }

    dot(v: Vector): number {
        return this.x * v.x + this.y * v.y;
    }

    projectedOnto(v: Vector): Vector {
        return v.unit().multipliedBy(this.dot(v.unit()));
    }

    lerp(to: Vector, amount: number): Vector {
        return new Vector(
            this.x + (to.x - this.x) * amount,
            this.y + (to.y - this.y) * amount,
        );
    }

    rotatedByRadians(theta: number): Vector {
        const sin = Math.sin(theta);
        const cos = Math.cos(theta);
        return new Vector(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos,
        );
    }

    rotatedByDegrees(degrees: number): Vector {
        return this.rotatedByRadians(degrees * (Math.PI / 180));
    }

    copy() {
        return new Vector(this.x, this.y);
    }

    toString() {
        return `(${this.x},${this.y})`;
    }
}

export { Vector };
