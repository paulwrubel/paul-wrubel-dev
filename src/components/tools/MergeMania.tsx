// import { Box } from "@mui/material";

import Bezier from "bezier-easing";
import p5Types from "p5";
import Sketch from "react-p5";
import seedrandom from "seedrandom";

type AnimSubject = {
    power: number;
    startPos: { x: number; y: number };
    endPos: { x: number; y: number };
};

type Animation = {
    id: string;
    subject: AnimSubject;
    startTime: number;
    endTime: number;
    curveFunc: Bezier.EasingFunction;
    onFinish?: () => void;
};

/**
 * Constants
 */

const blockSize = 100;
const padding = 5;
const roundingRadius = 12;

const columnCount = 5;
const rowCount = 6;

const width = blockSize * columnCount + padding * (columnCount + 1);
const height = blockSize * (rowCount + 1) + padding * (rowCount + 3);

/**
 * Variables
 */

const columnPowers: number[][] = [...Array(columnCount).keys()].map(() =>
    [...Array(rowCount).keys()].map(() => -1),
);
let runningAnimations: Animation[] = [];
let animLock = false;

const randRangeInt = (
    min: number,
    max: number,
    rng?: seedrandom.PRNG,
): number => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor((rng?.quick() ?? Math.random()) * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
};

const getColorFromNumber = (p5: p5Types, n: number): p5Types.Color => {
    const rng = seedrandom(`b${n}`);
    return p5.color(
        `hsl(${randRangeInt(0, 360, rng)}, ${randRangeInt(
            50,
            100,
            rng,
        )}%, ${randRangeInt(50, 70, rng)}%)`,
    );
};

const getNextOpenIndexInColumn = (columnIndex: number): number => {
    return columnPowers[columnIndex].findIndex((p) => p === -1);
};

const addPowerToColumn = (columnIndex: number, power: number) => {
    const index = getNextOpenIndexInColumn(columnIndex);
    if (index !== -1) {
        columnPowers[columnIndex][index] = power;
    }
};

const actualCoordinatesFromGrid = (x: number, y: number): number[] => {
    return [
        padding + padding * x + blockSize * x,
        height - (padding * (y + 1) + blockSize * (y + 1)),
    ];
};

const tryCheckMergeSingleStep = (
    p5: p5Types,
    activeColumn: number,
): boolean => {
    console.log(activeColumn);
    let willMerge = false;
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
        for (let index = 0; index < rowCount; index++) {
            const column = columnPowers[columnIndex];
            // check for vertical merging
            if (
                index < rowCount - 1 &&
                column[index] == column[index + 1] &&
                column[index] !== -1
            ) {
                // do vertical merge
                const currentPower = column[index];
                willMerge = true;
                const [actualStartX, actualStartY] = actualCoordinatesFromGrid(
                    columnIndex,
                    index + 1,
                );
                const [actualEndX, actualEndY] = actualCoordinatesFromGrid(
                    columnIndex,
                    index,
                );

                const animID = `from-${columnIndex},${
                    index + 1
                }-to-${columnIndex},${index}`;
                const durationMillis = 300;

                runningAnimations.push({
                    id: animID,
                    subject: {
                        power: currentPower + 1,
                        startPos: { x: actualStartX, y: actualStartY },
                        endPos: { x: actualEndX, y: actualEndY },
                    },
                    startTime: p5.frameCount,
                    endTime:
                        p5.frameCount +
                        (durationMillis / 1000) * p5.frameRate(),
                    curveFunc: Bezier(0.6, 1, 0, 1),
                    onFinish: () => {
                        // addPowerToColumn(columnIndex, 0);
                        columnPowers[columnIndex][index] = currentPower + 1;
                        runningAnimations = runningAnimations.filter(
                            (a) => a.id !== animID,
                        );
                        const willMerge = tryCheckMergeSingleStep(
                            p5,
                            columnIndex,
                        );
                        animLock = willMerge;
                    },
                });
                columnPowers[columnIndex][index] = -1;
                columnPowers[columnIndex][index + 1] = -1;
            }
        }
    }
    return willMerge;
};

const MergeMania = () => {
    const mouseIsOverColumnRect = (
        p5: p5Types,
        columnIndex: number,
    ): boolean => {
        const topLeft = [
            padding * (columnIndex + 1) + columnIndex * blockSize,
            blockSize + padding * 2,
        ];
        const bottomRight = [
            padding * (columnIndex + 1) + columnIndex * blockSize + blockSize,
            blockSize +
                padding * 2 +
                (blockSize * rowCount + padding * rowCount + 1),
        ];
        return (
            p5.mouseX > topLeft[0] &&
            p5.mouseX < bottomRight[0] &&
            p5.mouseY > topLeft[1] &&
            p5.mouseY < bottomRight[1]
        );
    };

    const drawPowerBlock = (
        p5: p5Types,
        x: number,
        y: number,
        power: number,
    ) => {
        p5.frameCount;
        if (power >= 0) {
            // draw block background
            p5.fill(getColorFromNumber(p5, power));
            p5.rect(x, y, blockSize, blockSize, roundingRadius);

            // draw text
            p5.fill(p5.color("#000"));
            p5.textAlign(p5.CENTER, p5.CENTER);
            p5.textSize(48);
            p5.textFont('"Source Code Pro", monospace');
            // console.log(blockSize);
            p5.text(`${2 ** power}`, x + blockSize / 2, y + blockSize / 2);
        }
    };

    const drawPowerBlockAtGridLocation = (
        p5: p5Types,
        x: number,
        y: number,
        power: number,
    ) => {
        const [actualX, actualY] = actualCoordinatesFromGrid(x, y);
        drawPowerBlock(p5, actualX, actualY, power);
    };

    const mouseClicked = (p5: p5Types) => {
        for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
            if (
                !animLock &&
                mouseIsOverColumnRect(p5, columnIndex) &&
                columnPowers[columnIndex].some((p) => p === -1)
            ) {
                animLock = true;
                const endGridPosY = getNextOpenIndexInColumn(columnIndex);

                const [actualStartX, actualStartY] = actualCoordinatesFromGrid(
                    columnIndex,
                    5,
                );
                const [actualEndX, actualEndY] = actualCoordinatesFromGrid(
                    columnIndex,
                    endGridPosY,
                );

                const animID = `from-${columnIndex},${5}-to-${columnIndex},${endGridPosY}`;
                const durationMillis = 150;

                runningAnimations.push({
                    id: animID,
                    subject: {
                        power: 0,
                        startPos: { x: actualStartX, y: actualStartY },
                        endPos: { x: actualEndX, y: actualEndY },
                    },
                    startTime: p5.frameCount,
                    endTime:
                        p5.frameCount +
                        (durationMillis / 1000) * p5.frameRate(),
                    curveFunc: Bezier(0.6, 1, 0, 1),
                    onFinish: () => {
                        addPowerToColumn(columnIndex, 0);
                        runningAnimations = runningAnimations.filter(
                            (a) => a.id !== animID,
                        );
                        const willMerge = tryCheckMergeSingleStep(
                            p5,
                            columnIndex,
                        );
                        animLock = willMerge;
                    },
                });
                // latestAddTime = p5.frameCount;
                console.log("clicked on " + columnIndex);
            }
        }
    };

    const setup = (p5: p5Types, canvasParentRef: Element) => {
        p5.createCanvas(width, height).parent(canvasParentRef);
        p5.frameRate(144);
    };

    const draw = (p5: p5Types) => {
        // clear the canvas for redraw
        p5.clear();

        // set the background color to black
        p5.background(p5.color("#000"));

        // draw the columns
        for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
            p5.fill(p5.color("#222"));
            // check for and possibly apply hover color
            if (mouseIsOverColumnRect(p5, columnIndex)) {
                p5.fill(p5.color("#333"));
            }
            // draw columns
            p5.rect(
                padding * (columnIndex + 1) + columnIndex * blockSize,
                blockSize + padding * 2,
                blockSize,
                blockSize * rowCount + padding * rowCount + 1,
                roundingRadius,
            );
        }

        // draw the power blocks

        for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
            for (let index = 0; index < rowCount; index++) {
                drawPowerBlockAtGridLocation(
                    p5,
                    columnIndex,
                    index,
                    columnPowers[columnIndex][index],
                );
            }
        }
        runningAnimations.forEach((animation) => {
            const time = p5.map(
                p5.frameCount,
                animation.startTime,
                animation.endTime,
                0,
                1,
                true,
            );
            const progression = animation.curveFunc(time);
            const x = p5.map(
                progression,
                0,
                1,
                animation.subject.startPos.x,
                animation.subject.endPos.x,
            );
            const y = p5.map(
                progression,
                0,
                1,
                animation.subject.startPos.y,
                animation.subject.endPos.y,
            );

            drawPowerBlock(p5, x, y, animation.subject.power);

            if (p5.frameCount >= animation.endTime) {
                animation.onFinish?.();
            }
        });
    };

    return <Sketch setup={setup} draw={draw} mouseClicked={mouseClicked} />;
};

export default MergeMania;
