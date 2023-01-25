class Vector {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    add = (v: Vector): Vector => new Vector(this.x + v.x, this.y + v.y);

    sub = (v: Vector): Vector => new Vector(this.x - v.x, this.y - v.y);

    mult = (s: number): Vector => new Vector(this.x * s, this.y * s);

    div = (s: number): Vector => new Vector(this.x / s, this.y / s);

    unit = (): Vector => this.div(this.magnitude);

    withMagnitude = (m: number): Vector => this.mult(m / this.magnitude);

    lerp = (to: Vector, amount: number) =>
        new Vector(
            this.x + (to.x - this.x) * amount,
            this.y + (to.y - this.y) * amount,
        );

    rotate = (theta: number) => {
        const sin = Math.sin(theta);
        const cos = Math.cos(theta);
        return new Vector(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos,
        );
    };

    copy = () => new Vector(this.x, this.y);

    toString = () => `(${this.x},${this.y})`;
}

export { Vector };
