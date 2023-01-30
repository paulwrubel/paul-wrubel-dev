import p5Types from "p5";

import { Line } from "./Line";
import { Vector } from "./Vector";
class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    drawAsCircle(p5: p5Types, diameter: number) {
        p5.circle(this.x, this.y, diameter);
    }

    to(p: Point): Vector {
        return new Vector(p.x - this.x, p.y - this.y);
    }

    lineTo(p: Point): Line {
        return new Line(this, p);
    }

    add(v: Vector): Point {
        return new Point(this.x + v.x, this.y + v.y);
    }

    lerp(to: Point, amount: number) {
        return new Point(
            this.x + (to.x - this.x) * amount,
            this.y + (to.y - this.y) * amount,
        );
    }

    copy(): Point {
        return new Point(this.x, this.y);
    }

    toString(): string {
        return `(${this.x},${this.y})`;
    }
}

export { Point };
