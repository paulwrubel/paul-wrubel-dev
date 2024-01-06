import { ReactP5Wrapper, Sketch } from "@p5-wrapper/react";
import { Vector } from "p5";

const WIDTH = 500;
const HEIGHT = 500;

const sketch: Sketch = (p5) => {
    type Bubble = {
        r: number;
        hue: number;
        position: Vector;
        velocity: Vector;
        buoyancy: number; // 0 = no buoyancy, 1 = weightless
    };
    const bubbles: Bubble[] = [];

    const SPEED_SCALAR = 0.05;

    const CEILING = -100;
    const WALL_MIN = HEIGHT / 2;
    const BUBBLE_ADD_INTERVAL = 30;

    const GRAVITY = p5.createVector(0, 0.15);
    const FRICTION = 0.99;

    const addBubble = () => {
        const bubble: Bubble = {
            r: p5.random(20, 50),
            hue: p5.random(360),
            position: p5.createVector(
                p5.random(100, p5.width - 100),
                p5.random(-1000, -200),
            ),
            velocity: p5.createVector(0, 0),
            buoyancy: p5.random(0, 1),
        };
        bubbles.push(bubble);
    };

    const checkBubbleAgainstOtherBubble = (
        bubble: Bubble,
        otherBubble: Bubble,
    ) => {
        const distance = bubble.position.dist(otherBubble.position);
        if (distance < bubble.r + otherBubble.r) {
            const away = Vector.sub(bubble.position, otherBubble.position);

            const overlap = bubble.r + otherBubble.r - distance;
            bubble.position.add(away.mult(overlap / distance));

            const mag = bubble.velocity.mag();
            bubble.velocity = away.copy().setMag(mag);
            otherBubble.velocity = away.copy().mult(-1).setMag(mag);
        }
    };

    const checkBubbleBoundsCollision = (bubble: Bubble) => {
        if (bubble.position.y > p5.height - bubble.r) {
            bubble.position.y = p5.height - bubble.r;
            bubble.velocity.y *= -1;
            bubble.velocity.x += p5.random(-1, 1);
        }

        if (bubble.position.y < CEILING + bubble.r) {
            bubble.position.y = CEILING + bubble.r;
            bubble.velocity.y *= -1;
        }

        if (bubble.position.y < WALL_MIN) {
            if (bubble.position.x < bubble.r) {
                bubble.position.x = bubble.r;
                bubble.velocity.x *= -1;
            } else if (bubble.position.x > p5.width - bubble.r) {
                bubble.position.x = p5.width - bubble.r;
                bubble.velocity.x *= -1;
            }
        }
    };

    const updateBubbles = () => {
        for (const bubble of bubbles) {
            bubble.position.add(
                bubble.velocity.copy().mult(p5.deltaTime * SPEED_SCALAR),
            );
            bubble.velocity.add(Vector.mult(GRAVITY, 1 - bubble.buoyancy));
            bubble.velocity.mult(FRICTION);

            for (const otherBubble of bubbles) {
                if (bubble === otherBubble) {
                    continue;
                }

                checkBubbleAgainstOtherBubble(bubble, otherBubble);
            }

            checkBubbleBoundsCollision(bubble);
        }
    };

    const drawBubbles = () => {
        for (const bubble of bubbles) {
            p5.stroke(bubble.hue, 100, 100);
            p5.noFill();
            p5.circle(bubble.position.x, bubble.position.y, bubble.r * 2);
        }
    };

    p5.setup = () => {
        p5.createCanvas(WIDTH, HEIGHT);
        p5.colorMode(p5.HSB, 360, 100, 100);
    };

    p5.draw = () => {
        p5.background(0);

        if (p5.frameCount % BUBBLE_ADD_INTERVAL === 0) {
            addBubble();
        }

        updateBubbles();
        drawBubbles();

        for (let i = bubbles.length - 1; i >= 0; i--) {
            const bubble = bubbles[i];
            if (
                bubble.position.x < -bubble.r ||
                bubble.position.x > p5.width + bubble.r
            ) {
                bubbles.splice(i, 1);
            }
        }
    };
};

const Entry = () => {
    return <ReactP5Wrapper sketch={sketch} />;
};

export default Entry;
