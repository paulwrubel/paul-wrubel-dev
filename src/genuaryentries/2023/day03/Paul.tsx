import { ReactP5Wrapper, Sketch } from "@p5-wrapper/react";

const WIDTH = 500;
const HEIGHT = 500;

const sketch: Sketch = (p5) => {
    const SQUARE_SIZE = 500;
    const LEVELS = 10;

    p5.setup = () => {
        p5.createCanvas(WIDTH, HEIGHT);
        p5.angleMode(p5.DEGREES);
    };

    p5.draw = () => {
        p5.background(255);

        const x = p5.mouseX;
        const y = p5.mouseY;

        const xDist = x - WIDTH / 2;
        const yDist = y - HEIGHT / 2;

        const scalingPerLevel = 0.5;
        const translationPerLevel = [-100, -100];
        const rotationPerLevel = (xDist * yDist) / 2000;

        p5.push();
        p5.translate(x, y);
        for (let i = 0; i < LEVELS; i++) {
            p5.push();
            p5.translate(-translationPerLevel[0], -translationPerLevel[1]);

            p5.strokeWeight(1.5 / scalingPerLevel ** i);
            p5.square(-SQUARE_SIZE / 2, -SQUARE_SIZE / 2, SQUARE_SIZE);
            p5.circle(300, 300, SQUARE_SIZE / 4);

            p5.pop();

            p5.scale(scalingPerLevel);
            p5.rotate(rotationPerLevel);
        }
        p5.pop();
    };
};

const Entry = () => {
    return <ReactP5Wrapper sketch={sketch} />;
};

export default Entry;
