import { P5CanvasInstance, ReactP5Wrapper, Sketch } from "@p5-wrapper/react";

const WIDTH = 500;
const HEIGHT = 500;

const sketch: Sketch = (p5: P5CanvasInstance) => {
    // Class describing the properties of a single particle.
    class Particle {
        x: number;
        y: number;
        r: number;
        xSpeed: number;
        ySpeed: number;

        // Setting the coordinates, radius, and the
        // speed of a particle in both the coordinates axes.
        constructor() {
            this.x = Math.random() * p5.width;
            this.y = Math.random() * p5.height;
            this.r = Math.random() * 6 + 1;
            this.xSpeed = Math.random() * 16 - 8;
            this.ySpeed = Math.random() * 3 - 1.5;
        }

        // Creation of a particle.
        createParticle() {
            p5.stroke("#B92015");
            p5.fill("#FF9800");
            p5.circle(this.x, this.y, this.r);
        }

        // Setting the particle in motion.
        moveParticle() {
            if (this.x < 0 || this.x > p5.width) this.xSpeed *= -2;
            if (this.y < 0 || this.y > p5.height) this.ySpeed *= -1;
            this.x += this.xSpeed;
            this.y += this.ySpeed;
        }

        // This function creates the connections (lines)
        // between particles which are less than a certain distance apart.
        joinParticles(particles: Particle[]) {
            particles.forEach((element) => {
                const dis = p5.dist(this.x, this.y, element.x, element.y);
                if (dis < 1) {
                    p5.line(this.x, this.y, element.x, element.y);
                }
            });
        }
    }

    // Array to add multiple particles.
    const particles: Particle[] = [];

    p5.setup = () => {
        p5.createCanvas(WIDTH, HEIGHT);
        for (let i = 0; i < p5.width / 0.5; i++) {
            particles.push(new Particle());
        }
    };

    p5.draw = () => {
        p5.background(45, 0, 150, 90);
        for (let i = 0; i < particles.length; i++) {
            particles[i].createParticle();
            particles[i].moveParticle();
        }
    };
};

const Entry = () => {
    return <ReactP5Wrapper sketch={sketch} />;
};

export default Entry;
