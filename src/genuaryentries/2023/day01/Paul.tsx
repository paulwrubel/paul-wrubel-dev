import { P5CanvasInstance, ReactP5Wrapper, Sketch } from "@p5-wrapper/react";
import { Image } from "p5";

import rawImage from "./Happy2024.png";

const WIDTH = 500;
const HEIGHT = 500;

const sketch: Sketch = (p5: P5CanvasInstance) => {
    type Particle = {
        x: number;
        y: number;
        radius: number;
        direction: number[];
        colorIndex: number;
        color: number[];
    };
    const particles: Particle[] = [];
    let image: Image | null = null;

    const USE_IMAGE_INDEX = true;

    const FRAMES_PER_UPDATE = 1;
    const NEW_PARTICLES_PER_UPDATE = 20;
    const MAX_PARTICLES = 8_000;

    const SPEED_SCALAR = 0.03;

    const addParticle = () => {
        const newParticle: Particle = {
            x: 0,
            y: 0,
            radius: 0,
            direction: [0, 0],
            colorIndex: 0,
            color: [0, 0, 0, 0],
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
            particle.radius = p5.random(10, 20);
        }
        const directionVector = p5
            .createVector(p5.random(0.1, 0.5), 0)
            .rotate(p5.random(360));
        particle.direction = [directionVector.x, directionVector.y];
        if (USE_IMAGE_INDEX) {
            particle.colorIndex = getImagePixelColorIndexAt(x, y);
        } else {
            particle.color = getImagePixelColorAt(x, y);
        }
    };

    const getImagePixelColorAt = (x: number, y: number): number[] => {
        if (image) {
            const imgX = x * (image.width / p5.width);
            const imgY = y * (image.height / p5.height);
            const [r, g, b] = image.get(imgX, imgY);

            return [r, g, b];
        } else {
            return [255, 255, 255];
        }
    };

    const getImagePixelColorIndexAt = (x: number, y: number): number => {
        if (image) {
            const imgX = Math.floor(x * (image.width / p5.width));
            const imgY = Math.floor(y * (image.height / p5.height));

            const arrWidth = image.width * 4;

            const index = imgX * 4 + imgY * arrWidth;
            if (p5.random() < 0.1) {
                // console.log(index);
            }
            return index;
        } else {
            return 0;
        }
    };

    const drawParticles = (p5: P5CanvasInstance) => {
        for (const { x, y, radius, colorIndex, color } of particles) {
            if (USE_IMAGE_INDEX) {
                p5.stroke(
                    (image as Image).pixels[colorIndex],
                    (image as Image).pixels[colorIndex + 1],
                    (image as Image).pixels[colorIndex + 2],
                    (image as Image).pixels[colorIndex + 3],
                );
            } else {
                p5.stroke(color);
            }
            p5.strokeWeight(radius / 2);
            p5.point(x, y);
        }
    };

    const updateParticles = (p5: P5CanvasInstance) => {
        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            particle.x += particle.direction[0] * p5.deltaTime * SPEED_SCALAR;
            particle.y += particle.direction[1] * p5.deltaTime * SPEED_SCALAR;

            if (USE_IMAGE_INDEX) {
                particle.colorIndex = getImagePixelColorIndexAt(
                    particle.x,
                    particle.y,
                );
            } else {
                particle.color = getImagePixelColorAt(particle.x, particle.y);
            }

            if (
                particle.x >= WIDTH ||
                particle.x < 0 ||
                particle.y >= HEIGHT ||
                particle.y < 0
            ) {
                resetParticle(particle);
            }
        }
    };

    p5.preload = () => {
        image = p5.loadImage(rawImage);
    };

    p5.setup = () => {
        p5.createCanvas(WIDTH, HEIGHT);
        p5.angleMode(p5.DEGREES);
        image?.loadPixels();
    };

    p5.draw = () => {
        p5.background(0);

        // draw particles
        drawParticles(p5);

        // update particles
        updateParticles(p5);

        // add / shift particles
        if (p5.frameCount % FRAMES_PER_UPDATE === 0) {
            for (let i = 0; i < NEW_PARTICLES_PER_UPDATE; i++) {
                if (particles.length < MAX_PARTICLES) {
                    addParticle();
                }
            }
        }
    };
};

const Entry = () => {
    return <ReactP5Wrapper sketch={sketch} />;
};

export default Entry;
