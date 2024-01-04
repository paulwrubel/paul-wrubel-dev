import { ReactP5Wrapper, Sketch } from "@p5-wrapper/react";

const WIDTH = 500;
const HEIGHT = 500;

const sketch: Sketch = (p5) => {
    p5.setup = () => {
        p5.createCanvas(WIDTH, HEIGHT);
    };

    p5.draw = () => {
        p5.background(200);
    };
};

const Entry = () => {
    return <ReactP5Wrapper sketch={sketch} />;
};

export default Entry;
