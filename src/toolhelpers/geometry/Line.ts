import p5Types from "p5";

import { Point } from "./Point";

class Line {
    a: Point;
    b: Point;
    constructor(a: Point, b: Point) {
        this.a = a;
        this.b = b;
    }

    get length() {
        const dx = this.a.x - this.b.x;
        const dy = this.a.y - this.b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    draw(p5: p5Types) {
        return p5.line(this.a.x, this.a.y, this.b.x, this.b.y);
    }

    pointAlong(amount: number): Point {
        return new Point(
            this.a.x + (this.b.x - this.a.x) * amount,
            this.a.y + (this.b.y - this.a.y) * amount,
        );
    }

    copy(): Line {
        return new Line(this.a.copy(), this.a.copy());
    }

    toString(): string {
        return `(${this.a} <--> ${this.b})`;
    }
}

export { Line };
