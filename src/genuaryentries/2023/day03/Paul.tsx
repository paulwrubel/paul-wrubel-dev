import { ReactP5Wrapper, Sketch } from "@p5-wrapper/react";

import { randRangeInt, shuffleArray } from "utils";

const WIDTH = 500;
const HEIGHT = 500;

const sketch: Sketch = (p5) => {
    const PALETTES: string[][] = [
        ["#DB504A", "#FF6F59", "#254441", "#43AA8B"],
        ["#191716", "#440D0F", "#603A40", "#84596B"],
        ["#00BFB2", "#1A5E63", "#028090", "#F0F3BD"],
        ["#EFE9E7", "#DAE0F2", "#F9CFF2", "#52154E"],
        ["#272838", "#5D536B", "#7D6B91", "#989FCE"],
        ["#5A7D7C", "#DADFF7", "#232C33", "#A0C1D1"],
        ["#F92A82", "#ED7B84", "#F5DBCB", "#D6D5B3"],
        ["#966B9D", "#C98686", "#F2B880", "#FFF4EC"],
        ["#03045E", "#0077B6", "#00B4D8", "#90E0EF"],
        ["#6D213C", "#946846", "#BAAB68", "#E3C16F"],
    ];

    const LEVEL_BASE_SIZE = 1;
    const QUADRANT_SIZE = LEVEL_BASE_SIZE / 2;
    const LEVELS = 50;

    const FRAMES_PER_RECURSION = 50;

    const INSCRIBED_TRIANGLE_SHORT = (2 - Math.sqrt(3)) * QUADRANT_SIZE;
    const INSCRIBED_TRIANGLE_LONG = QUADRANT_SIZE - INSCRIBED_TRIANGLE_SHORT;

    let paletteIndex = 0;
    let palette = PALETTES[paletteIndex];

    const drawShapeSetAtOrigin = (palette: string[]) => {
        p5.push();

        // draw circle
        p5.fill(palette[0]);
        p5.circle(-QUADRANT_SIZE / 2, -QUADRANT_SIZE / 2, QUADRANT_SIZE);

        // draw triangle
        p5.fill(palette[1]);
        p5.triangle(
            QUADRANT_SIZE,
            0,
            0,
            -INSCRIBED_TRIANGLE_SHORT,
            INSCRIBED_TRIANGLE_LONG,
            -QUADRANT_SIZE,
        );

        // draw square
        p5.fill(palette[2]);
        p5.square(0, 0, QUADRANT_SIZE);

        // draw diamond quad
        p5.fill(palette[3]);
        p5.quad(
            -QUADRANT_SIZE / 2,
            0,
            0,
            QUADRANT_SIZE / 2,
            -QUADRANT_SIZE / 2,
            QUADRANT_SIZE,
            -QUADRANT_SIZE,
            QUADRANT_SIZE / 2,
        );

        p5.pop();
    };

    p5.mouseClicked = () => {
        if (PALETTES.length > 1) {
            let newPaletteIndex = randRangeInt(0, PALETTES.length - 1);
            while (newPaletteIndex === paletteIndex) {
                newPaletteIndex = randRangeInt(0, PALETTES.length - 1);
            }
            paletteIndex = newPaletteIndex;
            palette = PALETTES[paletteIndex];
            shuffleArray(palette);
        }
    };

    p5.setup = () => {
        p5.createCanvas(WIDTH, HEIGHT);
        p5.angleMode(p5.DEGREES);
    };

    p5.draw = () => {
        p5.background(255);

        const recursionProgress =
            (p5.frameCount % FRAMES_PER_RECURSION) / FRAMES_PER_RECURSION;

        const x = p5.mouseX;
        const y = p5.mouseY;

        const scalingPerLevel = 2.0;

        const recursionScaling = 1.0 + 1.0 * recursionProgress;

        p5.translate(x, y);
        p5.rotate(90 * recursionProgress);
        p5.scale(recursionScaling);
        p5.push();

        for (let i = 0; i < LEVELS - 1; i++) {
            p5.push();
            p5.strokeWeight(
                (0.5 * (3.0 - recursionScaling)) / scalingPerLevel ** (i + 1),
            );
            p5.translate(QUADRANT_SIZE, -QUADRANT_SIZE);
            p5.rotate(90);
            p5.scale(scalingPerLevel);
        }
        for (let i = 0; i < LEVELS; i++) {
            // p5.strokeWeight(1.5 / scalingPerLevel ** i);
            // draw shapes
            drawShapeSetAtOrigin(palette);
            p5.pop();
            // p5.translate(-x / 2, -y / 2);
            // p5.translate(QUADRANT_SIZE / 2, QUADRANT_SIZE / 2);

            // p5.rotate(90);
            // // p5.translate(-QUADRANT_SIZE / 2, -QUADRANT_SIZE / 2);
            // p5.scale(scalingPerLevel);
            // p5.translate(x, y);
        }
    };
};

const Entry = () => {
    return <ReactP5Wrapper sketch={sketch} />;
};

export default Entry;
