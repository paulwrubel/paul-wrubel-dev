// import { Box } from "@mui/material";

import Bezier from "bezier-easing";
import p5Types from "p5";
import Sketch from "react-p5";
import seedrandom from "seedrandom";

type LocalStorageData = {
    minimumPower: number;
    powerProgression: number[];
    columnPowers: number[][];
};

type AnimSubject = {
    power: number;
    startPos: number[];
    endPos: number[];
    startSize: number;
    endSize: number;
};

type AnimGridSubject = {
    power: number;
    startGridPos: number[];
    endGridPos: number[];
    startSize: number;
    endSize: number;
};

type Animation = {
    id: string;
    subjects: AnimSubject[];
    startTime: number;
    endTime: number;
    curveFunc: Bezier.EasingFunction;
    onFinish?: () => void;
};

/**
 * Constants
 */

// blocks
const blockSize = 100;
const padding = 5;
const roundingRadius = 12;

// columns
const columnCount = 5;
const rowCount = 6;

// canvas
const width = blockSize * columnCount + padding * (columnCount + 1);
const height = blockSize * (rowCount + 1) + padding * (rowCount + 3);

// animations
const newBlockAnimationDurationMillis = 200;
const newBlockAnimationCurveFunction = Bezier(0.6, 1, 0, 1);

const mergeAnimationDurationMillis = 300;
const mergeAnimationCurveFunction = Bezier(0.2, 0, 0, 1);

const collapseAnimationDurationMillis = 300;
const collapseAnimationCurveFunction = Bezier(0.4, 1, 0, 1);

const removeBlockAnimationDurationMillis = 500;
const removeBlockAnimationCurveFunction = Bezier(0.6, 1, 0, 1);

// progressiong settings
const stepsAboveMinimumToAdvance = 8;
const stepsAboveMinimumToDrop = 3;

// misc
const localStorageKey = "mergemania";

/**
 * Variables
 */

let columnPowers: number[][] = [...Array(columnCount).keys()].map(() =>
    [...Array(rowCount).keys()].map(() => -1),
);
let runningAnimations: Animation[] = [];
let animLock = false;
let minimumPower = 0;
let powerProgression = [0, 0];

// const randomRange = (
//     min: number,
//     max: number,
//     rng?: seedrandom.PRNG,
// ): number => {
//     return (rng?.quick() ?? Math.random()) * (max - min) + min;
// };

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
    const rng = seedrandom(`c${n}`);
    return p5.color(
        `hsl(${randRangeInt(0, 360, rng)}, ${randRangeInt(
            50,
            100,
            rng,
        )}%, ${randRangeInt(50, 70, rng)}%)`,
    );
};

const saveToLocalStorage = (p5: p5Types) => {
    const saveData: LocalStorageData = {
        minimumPower: minimumPower,
        powerProgression: powerProgression,
        columnPowers: columnPowers,
    };
    p5.storeItem(localStorageKey, saveData);
};

const loadFromLocalStorage = (p5: p5Types) => {
    const saveData = p5.getItem(localStorageKey) as
        | LocalStorageData
        | undefined
        | null;

    if (saveData) {
        minimumPower = saveData.minimumPower;
        powerProgression = saveData.powerProgression;
        columnPowers = saveData.columnPowers;
    }
};

const getFormattedBlockText = (power: number): string => {
    let symbols = ["", ..."kmgtpezyrq".split("")];
    let scaledPower = power;
    if (power >= symbols.length * 10) {
        scaledPower = power - symbols.length * 10;

        const newSymbolsString = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        symbols = [
            ...newSymbolsString.split(""),
            ...newSymbolsString
                .split("")
                .flatMap((s1) =>
                    newSymbolsString.split("").map((s2) => s1 + s2),
                ),
        ];
    }
    const symbol = symbols
        .slice()
        .find(
            (s, i) => scaledPower >= i * 10 && scaledPower - i * 10 < 10,
        ) as string;
    const base = 2 ** (scaledPower - 10 * symbols.indexOf(symbol));
    return `${base}${symbol}`;
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

const advancePowerProgression = () => {
    powerProgression = [
        ...powerProgression.slice(1),
        minimumPower + randRangeInt(0, stepsAboveMinimumToDrop),
    ];
};

const getMaxPowerActive = (): number => {
    return columnPowers.reduce(
        (acc, column) =>
            Math.max(
                acc,
                column.reduce((acc2, p) => Math.max(acc2, p), 0),
            ),
        0,
    );
};

const actualCoordinatesFromGrid = ([x, y]: number[]): number[] => {
    return [
        padding + padding * x + blockSize * x,
        height - (padding * (y + 1) + blockSize * (y + 1)),
    ];
};

const addBlockAnimation = (
    p5: p5Types,
    subjects: AnimGridSubject[],
    durationMillis: number,
    curveFunc: Bezier.EasingFunction,
    onFinish: () => void,
) => {
    const trueSubjects: AnimSubject[] = subjects.map((subject) => {
        return {
            power: subject.power,
            startPos: actualCoordinatesFromGrid(subject.startGridPos),
            endPos: actualCoordinatesFromGrid(subject.endGridPos),
            startSize: subject.startSize,
            endSize: subject.endSize,
        };
    });

    const animID = `from-${subjects
        .map((s) => s.startGridPos)
        .join(":")}-to-${subjects.map((s) => s.endGridPos).join(":")}`;

    runningAnimations.push({
        id: animID,
        subjects: trueSubjects,
        startTime: p5.frameCount,
        endTime: p5.frameCount + (durationMillis / 1000) * p5.frameRate(),
        curveFunc: curveFunc,
        onFinish: () => {
            runningAnimations = runningAnimations.filter(
                (a) => a.id !== animID,
            );
            onFinish();
        },
    });
};

const tryCheckCollapse = (
    p5: p5Types,
    activeColumn: number,
    onAnimChainFinished?: () => void,
) => {
    let didCollapse = false;
    const subjects: AnimGridSubject[] = [];
    const onFinishFunctions: (() => void)[] = [];
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
        const column = columnPowers[columnIndex];
        for (let index = 0; index < rowCount; index++) {
            if (column[index] === -1) {
                // there's no block at this position!
                // find the position of the next block above this one
                const nextBlockIndex = column.findIndex(
                    (p, i) => i > index && p !== -1,
                );
                if (nextBlockIndex !== -1) {
                    // we have a block and a place to move it
                    didCollapse = true;
                    animLock = true;

                    const newPower = column[nextBlockIndex];
                    const fromGrid = [columnIndex, nextBlockIndex];
                    const toGrid = [columnIndex, index];

                    subjects.push({
                        power: newPower,
                        startGridPos: fromGrid,
                        endGridPos: toGrid,
                        startSize: blockSize,
                        endSize: blockSize,
                    });

                    onFinishFunctions.push(() => {
                        columnPowers[columnIndex][index] = newPower;
                    });

                    // post add procedure
                    columnPowers[columnIndex][nextBlockIndex] = -1;
                }
            }
        }
    }

    if (didCollapse) {
        addBlockAnimation(
            p5,
            subjects,
            collapseAnimationDurationMillis,
            collapseAnimationCurveFunction,
            () => {
                onFinishFunctions.forEach((func) => func());
                animLock = false;
                tryCheckMergeSingleStep(p5, activeColumn, onAnimChainFinished);
            },
        );
    } else {
        tryCheckMergeSingleStep(p5, activeColumn, onAnimChainFinished);
    }
};

const areAdjacent = (p1: number[], p2: number[]): boolean => {
    return (
        (Math.abs(p1[0] - p2[0]) === 1 && Math.abs(p1[1] - p2[1]) === 0) ||
        (Math.abs(p1[0] - p2[0]) === 0 && Math.abs(p1[1] - p2[1]) === 1)
    );
};

const getCenterOfMergeGroup = (
    group: number[][],
    activeColumn: number,
): number[] => {
    if (group.length === 2) {
        if (group[0][0] === group[1][0]) {
            // same x coordinate, so these are vertically stacked
            // we should return the one on bottom
            return group[0][1] < group[1][1] ? group[0] : group[1];
        } else {
            // these must be horizontal
            // we should return the one closest to the active column
            return Math.abs(group[0][0] - activeColumn) <
                Math.abs(group[1][0] - activeColumn)
                ? group[0]
                : group[1];
        }
    }

    // for a group size of > 3, it will be sufficient to find the
    // locations that borders the most other group members
    let maxAdjacentCount = 0;
    const maxAdjacentIndex = group.reduce((acc, loc1, index) => {
        // find how many other group members this location is adjecent to
        const adjacentCount = group.reduce((acc, loc2) => {
            if (areAdjacent(loc1, loc2)) {
                // add an additional neighbor to the running count
                return acc + 1;
            }
            // no neighbor between loc1 and loc2, so same count
            return acc;
        }, 0);
        // if we found a new winner...
        if (adjacentCount > maxAdjacentCount) {
            // increase the count
            maxAdjacentCount = adjacentCount;
            // and save our index as the current "king"
            return index;
        }
        return acc;
    }, 0);

    return group[maxAdjacentIndex];
};

// eslint-disable-next-line sonarjs/cognitive-complexity
const findMergeGroups = () => {
    const mergeGroups: number[][][] = [];
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
        const column = columnPowers[columnIndex];
        for (let index = 0; index < rowCount; index++) {
            const thisPower = column[index];

            // if this spot is empty, move on
            if (thisPower === -1) {
                continue;
            }

            // helper function
            // check if this location is in some group already
            // and return that group's index if it is
            const checkAndAddToGroup = (current: number[], match: number[]) => {
                const currentGroupIndex = mergeGroups.findIndex((group) =>
                    group.some(
                        (loc) => loc[0] === current[0] && loc[1] === current[1],
                    ),
                );
                const matchGroupIndex = mergeGroups.findIndex((group) =>
                    group.some(
                        (loc) => loc[0] === match[0] && loc[1] === match[1],
                    ),
                );
                if (currentGroupIndex === -1 && matchGroupIndex !== -1) {
                    // match is in a group, so add current to that group
                    mergeGroups[matchGroupIndex].push(current);
                } else if (currentGroupIndex !== -1 && matchGroupIndex === -1) {
                    // current is in a group, so add match to that group
                    mergeGroups[currentGroupIndex].push(match);
                } else if (currentGroupIndex === -1 && matchGroupIndex === -1) {
                    // neither are in any group, so add a new group with both of them
                    mergeGroups.push([current, match]);
                }
            };

            // check north
            if (index < rowCount - 1 && column[index + 1] === thisPower) {
                checkAndAddToGroup(
                    [columnIndex, index],
                    [columnIndex, index + 1],
                );
            }

            // check east
            if (
                columnIndex < columnCount - 1 &&
                columnPowers[columnIndex + 1][index] === thisPower
            ) {
                checkAndAddToGroup(
                    [columnIndex, index],
                    [columnIndex + 1, index],
                );
            }

            // check south
            if (index > 0 && column[index - 1] === thisPower) {
                checkAndAddToGroup(
                    [columnIndex, index],
                    [columnIndex, index - 1],
                );
            }

            // check west
            if (
                columnIndex > 0 &&
                columnPowers[columnIndex - 1][index] === thisPower
            ) {
                checkAndAddToGroup(
                    [columnIndex, index],
                    [columnIndex - 1, index],
                );
            }
        }
    }
    return mergeGroups;
};

const tryCheckMergeSingleStep = (
    p5: p5Types,
    activeColumn: number,
    onAnimChainFinished?: () => void,
    // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
    const mergeGroups: number[][][] = findMergeGroups();

    // if we know we're gonna merge, might as well lock it now
    if (mergeGroups.length > 0) {
        animLock = true;
    }

    // assemble subjects and process changes
    const subjects: AnimGridSubject[] = [];
    const onFinishFunctions: (() => void)[] = [];
    for (let groupIndex = 0; groupIndex < mergeGroups.length; groupIndex++) {
        const group = mergeGroups[groupIndex];
        const groupCenter = getCenterOfMergeGroup(group, activeColumn);
        const newPower =
            columnPowers[groupCenter[0]][groupCenter[1]] + group.length - 1;

        for (let index = 0; index < group.length; index++) {
            const loc = group[index];
            if (loc[0] === groupCenter[0] && loc[1] === groupCenter[1]) {
                // we are the group center!
                continue;
            }
            subjects.push({
                power: newPower,
                startGridPos: loc,
                endGridPos: groupCenter,
                startSize: blockSize,
                endSize: blockSize,
            });
            columnPowers[loc[0]][loc[1]] = -1;
        }

        onFinishFunctions.push(() => {
            columnPowers[groupCenter[0]][groupCenter[1]] = newPower;
        });
    }
    if (mergeGroups.length > 0) {
        // add animation
        addBlockAnimation(
            p5,
            subjects,
            mergeAnimationDurationMillis,
            mergeAnimationCurveFunction,
            () => {
                onFinishFunctions.forEach((func) => func());
                animLock = false;
                tryCheckCollapse(p5, activeColumn, onAnimChainFinished);
            },
        );
    } else {
        onAnimChainFinished?.();
    }
};

const tryCheckNewMinimumPower = (p5: p5Types) => {
    // update the minimum power
    const newMinimumPower = Math.max(
        getMaxPowerActive() - (stepsAboveMinimumToAdvance - 1),
        0,
    );
    if (newMinimumPower > minimumPower) {
        minimumPower = newMinimumPower;

        // reset power progression
        powerProgression = powerProgression.map(
            () => minimumPower + randRangeInt(0, stepsAboveMinimumToDrop),
        );

        // remove all on-screen blocks below the new minimum
        let activeColumn = 0;
        let removedAnyBlock = false;
        const subjects: AnimGridSubject[] = [];
        for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
            const column = columnPowers[columnIndex];
            for (let index = 0; index < rowCount; index++) {
                const power = column[index];
                if (power !== -1 && power < minimumPower) {
                    removedAnyBlock = true;
                    // we'll just set it to whichever one we saw last, because why not
                    activeColumn = columnIndex;
                    // this is the removal animation
                    subjects.push({
                        power: columnPowers[columnIndex][index],
                        startGridPos: [columnIndex, index],
                        endGridPos: [columnIndex + 0.5, index - 0.5],
                        startSize: blockSize,
                        endSize: 0,
                    });
                    // just immediately remove it on-record
                    columnPowers[columnIndex][index] = -1;
                }
            }
        }

        if (removedAnyBlock) {
            addBlockAnimation(
                p5,
                subjects,
                removeBlockAnimationDurationMillis,
                removeBlockAnimationCurveFunction,
                () => {
                    tryCheckCollapse(p5, activeColumn);
                },
            );
        }
    }
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
        size: number = blockSize,
    ) => {
        p5.frameCount;
        if (power >= 0) {
            // draw block background
            p5.fill(getColorFromNumber(p5, power));
            p5.rect(x, y, size, size, roundingRadius);

            // draw text
            const blockText = getFormattedBlockText(power);
            p5.fill(p5.color("#000"));
            p5.textAlign(p5.CENTER, p5.CENTER);
            p5.textSize(44 * (size / blockSize));
            p5.textFont('"Source Code Pro", monospace');
            p5.text(blockText, x + size / 2, y + size / 2);
        }
    };

    const drawPowerBlockAtGridLocation = (
        p5: p5Types,
        x: number,
        y: number,
        power: number,
        size: number = blockSize,
    ) => {
        const [actualX, actualY] = actualCoordinatesFromGrid([x, y]);
        drawPowerBlock(p5, actualX, actualY, power, size);
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

                const newPower = powerProgression[0];
                const fromGrid = [columnIndex, 5];
                const toGrid = [columnIndex, endGridPosY];

                const powerProgressionCopy = powerProgression.slice();
                // advancePowerProgression();
                powerProgression = [];
                // powerProgression[powerProgressionCopy.length - 1] =
                addBlockAnimation(
                    p5,
                    [
                        // the block we are adding
                        {
                            power: newPower,
                            startGridPos: fromGrid,
                            endGridPos: toGrid,
                            startSize: blockSize,
                            endSize: blockSize,
                        },
                        // the power progression indicator block

                        // drawPowerBlockAtGridLocation(p5, 1.5, 6, powerProgression[0]);
                        // drawPowerBlockAtGridLocation(
                        //     p5,
                        //     2.5,
                        //     6,
                        //     powerProgression[1],
                        //     blockSize * 0.8,
                        // );

                        {
                            power: powerProgressionCopy[1],
                            startGridPos: [2.5, 6],
                            endGridPos: [1.5, 6],
                            startSize: blockSize * 0.8,
                            endSize: blockSize,
                        },
                    ],
                    newBlockAnimationDurationMillis,
                    newBlockAnimationCurveFunction,
                    () => {
                        addPowerToColumn(columnIndex, newPower);
                        powerProgression = powerProgressionCopy;
                        advancePowerProgression();
                        animLock = false;
                        tryCheckMergeSingleStep(p5, columnIndex, () => {
                            tryCheckNewMinimumPower(p5);
                            saveToLocalStorage(p5);
                        });
                    },
                );
            }
        }
    };

    const setup = (p5: p5Types, canvasParentRef: Element) => {
        p5.createCanvas(width, height).parent(canvasParentRef);
        p5.frameRate(144);
        loadFromLocalStorage(p5);
    };

    const draw = (p5: p5Types) => {
        // set the background color to black
        p5.background(p5.color("#000"));

        // draw the level
        const levelText = `Level ${minimumPower + 1}`;
        p5.fill(p5.color("#FFF"));
        p5.textAlign(p5.LEFT, p5.TOP);
        p5.textSize(32);
        p5.textFont('"Source Code Pro", monospace');
        p5.text(levelText, 10, 10);

        // draw the current powerblock progression
        drawPowerBlockAtGridLocation(p5, 1.5, 6, powerProgression[0]);
        drawPowerBlockAtGridLocation(
            p5,
            2.5,
            6,
            powerProgression[1],
            blockSize * 0.8,
        );

        // draw the minimum powerblock for reference
        drawPowerBlockAtGridLocation(p5, 4.5, 6, minimumPower, blockSize * 0.5);

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
                blockSize + padding * 3,
                blockSize,
                blockSize * rowCount + padding * (rowCount - 1),
                roundingRadius,
            );
        }

        // draw power blocks
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

        // draw running animations
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
            animation.subjects.forEach((subject) => {
                const x = p5.map(
                    progression,
                    0,
                    1,
                    subject.startPos[0],
                    subject.endPos[0],
                );
                const y = p5.map(
                    progression,
                    0,
                    1,
                    subject.startPos[1],
                    subject.endPos[1],
                );
                const size = p5.map(
                    progression,
                    0,
                    1,
                    subject.startSize,
                    subject.endSize,
                );
                drawPowerBlock(p5, x, y, subject.power, size);
            });

            if (p5.frameCount >= animation.endTime) {
                animation.onFinish?.();
            }
        });
    };

    return <Sketch setup={setup} draw={draw} mouseClicked={mouseClicked} />;
};

export default MergeMania;
