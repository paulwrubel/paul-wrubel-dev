import { ReactP5Wrapper, Sketch } from "@p5-wrapper/react";

import { clamp } from "utils";

const WIDTH = 500;
const HEIGHT = 500;

const sketch: Sketch = (p5) => {
    const PROGRESS_DELTA = 0.0001;
    const SPINNER_PROGRESS_DELTA = 0.00001;

    const TEXT_TOP_LEFT = [WIDTH / 2 - 60, HEIGHT - 70];

    const LOADING_BAR_STROKE_WEIGHT = 5;

    const LOADING_BAR_SIZE = [WIDTH - 40, 20];
    const LOADING_BAR_TOP_LEFT = [20, HEIGHT - 20 - LOADING_BAR_SIZE[1]];

    const LOADING_STAGE_RANGES = [
        [0, 0.25],
        [0.275, 0.475],
        [0.49, 0.5],
        [0.5, 0.75],
        [0.775, 0.975],
        [0.99, 1.0],
    ];

    let progress = 0;
    let spinnerProgress = 0.25;

    const mapProgressRange = (stageIndex: number): number => {
        const stageMin = LOADING_STAGE_RANGES[stageIndex][0];
        const stageMax = LOADING_STAGE_RANGES[stageIndex][1];

        return p5.map(
            clamp(progress, stageMin, stageMax),
            stageMin,
            stageMax,
            0,
            1.0,
        );
    };

    const drawLoadingText = () => {
        p5.fill(255);
        p5.text("Loading...", TEXT_TOP_LEFT[0], TEXT_TOP_LEFT[1], 100, 500);
    };

    const drawLoadingBarFrame = () => {
        p5.push();

        p5.stroke(255);
        p5.strokeWeight(LOADING_BAR_STROKE_WEIGHT);
        p5.noFill();

        p5.rect(
            LOADING_BAR_TOP_LEFT[0],
            LOADING_BAR_TOP_LEFT[1],
            LOADING_BAR_SIZE[0],
            LOADING_BAR_SIZE[1],
        );

        p5.pop();
    };

    const drawLoadingBarsHalf = (stageTwo: boolean) => {
        p5.push();

        p5.noStroke();
        p5.fill(stageTwo ? 0 : 255);

        const offset = LOADING_BAR_STROKE_WEIGHT / 2.5;

        // normal bar
        p5.rect(
            LOADING_BAR_TOP_LEFT[0] + offset,
            LOADING_BAR_TOP_LEFT[1] + offset,
            mapProgressRange(stageTwo ? 3 : 0) *
                (p5.width - LOADING_BAR_TOP_LEFT[0] - offset),
            LOADING_BAR_SIZE[1] - 2 * offset,
        );

        // backwards top bar
        p5.rect(
            p5.width - mapProgressRange(stageTwo ? 4 : 1) * p5.width,
            20,
            p5.width,
            LOADING_BAR_SIZE[1] - 2 * offset,
        );

        // small sliver left of main bar
        p5.rect(
            0,
            LOADING_BAR_TOP_LEFT[1] + offset,
            mapProgressRange(stageTwo ? 5 : 2) *
                (LOADING_BAR_TOP_LEFT[0] + offset),
            LOADING_BAR_SIZE[1] - 2 * offset,
        );

        p5.pop();
    };

    const drawLoadingBars = () => {
        drawLoadingBarsHalf(false);
        drawLoadingBarsHalf(true);

        // due to the way the loading bars are drawn, we
        // have to manually redraw the right edge of the border
        p5.push();

        p5.stroke(255);
        p5.strokeWeight(LOADING_BAR_STROKE_WEIGHT);
        p5.rect(
            LOADING_BAR_TOP_LEFT[0] + LOADING_BAR_SIZE[0],
            LOADING_BAR_TOP_LEFT[1],
            0,
            LOADING_BAR_SIZE[1],
        );

        p5.pop();
    };

    const drawSpinnerLoop = () => {
        p5.push();
        p5.noFill();
        for (let i = 0; i < 10; i++) {
            const squareLength = 10 + i * 5;
            const progressMultiplier = i + 10; // must be an integer

            const hueStart = spinnerProgress * 360 * 8;
            const hue = p5.map(i, 0, 50, hueStart, hueStart + 60);

            p5.colorMode(p5.HSB, 360, 100, 100);
            p5.strokeWeight(2);
            p5.stroke(hue % 360, 100, 100);

            p5.push();
            p5.rotate(spinnerProgress * 360 * progressMultiplier);
            p5.square(-squareLength / 2, -squareLength / 2, squareLength);
            p5.pop();
        }
        p5.pop();
    };

    const drawSpinner = () => {
        const x = p5.mouseX;
        const y = p5.mouseY;

        const ORBIT_DISTANCE = 50 * p5.sin(90 + spinnerProgress * 360 * 10);
        const ORBIT_SPEED = 1; // must be an integer

        p5.push();

        p5.translate(x, y);
        const rotationDegrees =
            -360 *
            spinnerProgress *
            ORBIT_SPEED *
            p5.sin(spinnerProgress * 360 * 10);
        p5.rotate(rotationDegrees);

        p5.push();
        p5.translate(ORBIT_DISTANCE, 0);
        p5.rotate(-rotationDegrees);
        drawSpinnerLoop();
        p5.pop();

        p5.push();
        p5.translate(-ORBIT_DISTANCE, 0);
        p5.rotate(-rotationDegrees);
        drawSpinnerLoop();
        p5.pop();

        p5.pop();
    };

    p5.setup = () => {
        p5.createCanvas(WIDTH, HEIGHT);
        p5.textFont('"Source Code Pro"', 24);
        p5.angleMode(p5.DEGREES);
    };

    p5.draw = () => {
        p5.background(0);

        progress += p5.deltaTime * PROGRESS_DELTA;
        progress %= 1.0;

        spinnerProgress += p5.deltaTime * SPINNER_PROGRESS_DELTA;
        spinnerProgress %= 1.0;

        // loading bar
        drawLoadingText();
        drawLoadingBarFrame();
        drawLoadingBars();

        // spinner
        drawSpinner();
    };
};

const Entry = () => {
    return <ReactP5Wrapper sketch={sketch} />;
};

export default Entry;
