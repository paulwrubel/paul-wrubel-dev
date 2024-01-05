import { P5CanvasInstance, ReactP5Wrapper, Sketch } from "@p5-wrapper/react";
import { Color, Image, Vector } from "p5";

import rawImage from "./Happy2024.png";

const WIDTH = 500;
const HEIGHT = 500;

const sketch: Sketch = (p5: P5CanvasInstance) => {
    type Particle = {
        x: number;
        y: number;
        radius: number;
        direction: Vector;
        color: Color;
    };
    const particles: Particle[] = [];
    let image: Image | null = null;

    const FRAMES_PER_UPDATE = 1;
    const NEW_PARTICLES_PER_UPDATE = 20;
    const MAX_PARTICLES = 10_000;

    const SPEED_SCALAR = 0.03;

    const addParticle = () => {
        const newParticle: Particle = {
            x: 0,
            y: 0,
            radius: 0,
            direction: p5.createVector(0, 0),
            color: p5.color(0, 0, 0, 0),
        };
        resetParticle(newParticle);
        particles.push(newParticle);
    };

    const resetParticle = (particle: Particle) => {
        const x = p5.random(p5.width);
        const y = p5.random(p5.height);

        particle.x = x;
        particle.y = y;
        if (p5.random() < 0.9) {
            particle.radius = p5.random(5, 10);
        } else {
            particle.radius = p5.random(10, 25);
        }
        particle.direction = p5
            .createVector(p5.random(0.1, 0.7), 0)
            .rotate(p5.random(360));
        particle.color = getImagePixelColorAt(x, y);
    };

    const getImagePixelColorAt = (x: number, y: number): Color => {
        if (image) {
            const imgX = x * (image.width / p5.width);
            const imgY = y * (image.height / p5.height);
            const [r, g, b, a] = image.get(imgX, imgY);

            return p5.color(r, g, b, a);
        } else {
            return p5.color(255);
        }
    };

    p5.preload = () => {
        image = p5.loadImage(rawImage);
    };

    p5.setup = () => {
        p5.createCanvas(WIDTH, HEIGHT);
        p5.angleMode(p5.DEGREES);
        // p5.frameRate(24);
    };

    p5.draw = () => {
        p5.background(0);

        // draw particles
        for (const { x, y, radius, color } of particles) {
            p5.stroke(color);
            p5.strokeWeight(radius / 2);
            p5.point(x, y);
        }

        // update particles
        // const toRelocate = [];
        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            particle.x += particle.direction.x * p5.deltaTime * SPEED_SCALAR;
            particle.y += particle.direction.y * p5.deltaTime * SPEED_SCALAR;

            particle.color = getImagePixelColorAt(particle.x, particle.y);

            if (
                particle.x >= WIDTH ||
                particle.x < 0 ||
                particle.y >= HEIGHT ||
                particle.y < 0
            ) {
                resetParticle(particle);
            }
        }

        // particles = newParticles;

        // add / shift particles
        if (p5.frameCount % FRAMES_PER_UPDATE === 0) {
            for (let i = 0; i < NEW_PARTICLES_PER_UPDATE; i++) {
                if (particles.length < MAX_PARTICLES) {
                    addParticle();
                }
                // console.log(particles.length);
            }
        }
    };
};

const Entry = () => {
    return <ReactP5Wrapper sketch={sketch} />;
};

export default Entry;
