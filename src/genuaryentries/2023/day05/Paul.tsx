import { ReactP5Wrapper, Sketch } from "@p5-wrapper/react";

import { randRangeInt } from "utils";

const WIDTH = 500;
const HEIGHT = 500;

const sketch: Sketch = (p5) => {
    const GRID_LENGTH = 60;
    const GAP_RANGE = [-8, 8];
    const OFFSET_RANGE = [-22, 22];
    const CORNER_VARIANCE_RANGE = [-10, 10];

    const HUE_VARIANCE_RANGE = [-10, 10];
    const SATURATION_VARIANCE_RANGE = [-2, 2];
    const BRIGHTNESS_VARIANCE_RANGE = [-5, 5];

    let rngSeed = 0;

    let baseHue = 0;
    let baseSaturation = 0;
    let baseBrightness = 0;

    const drawQuadAt = (x: number, y: number) => {
        const getVariance = () =>
            p5.random(CORNER_VARIANCE_RANGE[0], CORNER_VARIANCE_RANGE[1]);

        p5.push();

        p5.noStroke();
        p5.colorMode(p5.HSB);
        const hue =
            360 +
            baseHue +
            p5.random(HUE_VARIANCE_RANGE[0], HUE_VARIANCE_RANGE[1]);
        const saturation =
            baseSaturation +
            p5.random(
                SATURATION_VARIANCE_RANGE[0],
                SATURATION_VARIANCE_RANGE[1],
            );
        const brightness =
            baseBrightness +
            p5.random(
                BRIGHTNESS_VARIANCE_RANGE[0],
                BRIGHTNESS_VARIANCE_RANGE[1],
            );
        p5.fill(hue % 360, saturation % 100, brightness % 100, 0.4);
        for (let i = 0; i < 3; i++) {
            const length = (GRID_LENGTH / 2) * (1 - i * 0.1);
            p5.quad(
                x - length + getVariance(),
                y - length + getVariance(),
                x + length + getVariance(),
                y - length + getVariance(),
                x + length + getVariance(),
                y + length + getVariance(),
                x - length + getVariance(),
                y + length + getVariance(),
            );
        }

        p5.pop();
    };

    const drawQuadGrid = () => {
        const xn = Math.floor(WIDTH / GRID_LENGTH) + 4;
        const yn = Math.floor(HEIGHT / GRID_LENGTH) + 4;

        const xOffset = p5.random(OFFSET_RANGE[0], OFFSET_RANGE[1]);
        const yOffset = p5.random(OFFSET_RANGE[0], OFFSET_RANGE[1]);
        for (let i = 0; i < xn; i++) {
            for (let j = 0; j < yn; j++) {
                const x =
                    xOffset +
                    i * GRID_LENGTH +
                    p5.random(GAP_RANGE[0], GAP_RANGE[1]);
                const y =
                    yOffset +
                    j * GRID_LENGTH +
                    p5.random(GAP_RANGE[0], GAP_RANGE[1]);
                drawQuadAt(x, y);
            }
        }
    };

    p5.mouseClicked = () => {
        rngSeed = randRangeInt(0, 10000);

        baseHue = p5.random(0, 360);
        baseSaturation = p5.random(60, 100);
        baseBrightness = p5.random(50, 60);
    };

    p5.setup = () => {
        p5.createCanvas(WIDTH, HEIGHT);

        baseHue = p5.random(0, 360);
        baseSaturation = p5.random(30, 100);
        baseBrightness = p5.random(50, 90);
    };

    p5.draw = () => {
        p5.randomSeed(rngSeed);
        p5.background("#EEE0DF");

        drawQuadGrid();
    };
};

const Entry = () => {
    return <ReactP5Wrapper sketch={sketch} />;
};

export default Entry;
