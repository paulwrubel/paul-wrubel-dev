import { Vector } from "./Vector";

class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    to = (p: Point): Vector => new Vector(p.x - this.x, p.y - this.y);

    add = (v: Vector): Point => new Point(this.x + v.x, this.y + v.y);

    lerp = (to: Point, amount: number) =>
        new Point(
            this.x + (to.x - this.x) * amount,
            this.y + (to.y - this.y) * amount,
        );

    copy(): Point {
        return new Point(this.x, this.y);
    }

    toString(): string {
        return `(${this.x},${this.y})`;
    }
}

export { Point };
