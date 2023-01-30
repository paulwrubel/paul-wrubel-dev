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

    add(v: Vector): Vector {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    sub(v: Vector): Vector {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    mult(s: number): Vector {
        return new Vector(this.x * s, this.y * s);
    }

    div(s: number): Vector {
        return new Vector(this.x / s, this.y / s);
    }

    unit(): Vector {
        return this.div(this.magnitude);
    }

    withMagnitude(m: number): Vector {
        return this.mult(m / this.magnitude);
    }

    lerp(to: Vector, amount: number): Vector {
        return new Vector(
            this.x + (to.x - this.x) * amount,
            this.y + (to.y - this.y) * amount,
        );
    }

    rotateRadians(theta: number): Vector {
        const sin = Math.sin(theta);
        const cos = Math.cos(theta);
        return new Vector(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos,
        );
    }

    rotateDegrees(degrees: number): Vector {
        return this.rotateRadians(degrees * (Math.PI / 180));
    }

    copy() {
        return new Vector(this.x, this.y);
    }

    toString() {
        return `(${this.x},${this.y})`;
    }
}

export { Vector };
