class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    lerp = (to: Point, amount: number) => {
        return new Point(
            this.x + (to.x - this.x) * amount,
            this.y + (to.y - this.y) * amount,
        );
    };

    copy = () => new Point(this.x, this.y);

    toString = () => `(${this.x},${this.y})`;
}

export { Point };
