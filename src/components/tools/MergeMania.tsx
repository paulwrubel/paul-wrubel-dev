/* eslint-disable sonarjs/no-small-switch */
// import { Box } from "@mui/material";

import { useTheme } from "@mui/material";

import Bezier from "bezier-easing";
import p5Types from "p5";
import Sketch from "react-p5";
import seedrandom from "seedrandom";

type LocalStorageData = {
    currentLevel: number;
    blockProgression: Block[];
    blocks: (Block | null)[][];
};

type AnimSubject = {
    block: Block;
    startPos: number[];
    endPos: number[];
    startSize: number;
    endSize: number;
};

type AnimGridSubject = {
    block: Block;
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

type PowerBlock = {
    type: "power";
    power: number;
};

type WildcardBlock = {
    type: "wildcard";
    magnitude: number;
    directions: ("north" | "south" | "east" | "west")[];
};
type SpecialBlock = WildcardBlock;

type Block = PowerBlock | SpecialBlock;

/**
 * Constants
 */

// columns
const columnCount = 5;
const rowCount = 6;

// pre-sizing
const preWidth = 100 * columnCount + 5 * (columnCount + 1);
const preHeight = 100 * (rowCount + 1) + 5 * (rowCount + 3);
const scalar = Math.min(1, (window.innerWidth - 10) / preWidth);

// canvas
const width = preWidth * scalar;
const height = preHeight * scalar;

// blocks
const blockSize = 100 * scalar;
const padding = 5 * scalar;
const maxBlockFontSize = 44 * scalar;
const roundingRadius = 12 * scalar;

const specialBlockOdds = 0.5;
const colorProgression: string[] = [
    "#BAFF29",
    "#D90DA3",
    "#34E4EA",
    "#625AFF",
    "#D68FD6",
    "#CBC0AD",
    "#FE5F55",
    "#279AF1",
    "#FFDD78",
    "#B118C8",
];

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
const fontString = '"Source Code Pro", monospace';

/**
 * Variables
 */

let ranSetup = false;

const initialFill: Block | null = null;
let blocks: (Block | null)[][] = [...Array(columnCount).keys()].map(() =>
    [...Array(rowCount).keys()].map(() => initialFill),
);
let runningAnimations: Animation[] = [];
let animLock = false;
let currentLevel = 0;
let blockProgression: Block[] = [
    { type: "power", power: 0 },
    { type: "power", power: 0 },
];
let gameOver = false;

// const randomRange = (
//     min: number,
//     max: number,
//     rng?: seedrandom.PRNG,
// ): number => {
//     return (rng?.quick() ?? Math.random()) * (max - min) + min;
// };

const resetGame = () => {
    blocks = [...Array(columnCount).keys()].map(() =>
        [...Array(rowCount).keys()].map(() => initialFill),
    );
    runningAnimations = [];
    animLock = false;
    currentLevel = 0;
    blockProgression = [
        { type: "power", power: 0 },
        { type: "power", power: 0 },
    ];
    gameOver = false;
    console.log("did a sharp reset, mate!");
};

const randRangeInt = (
    min: number,
    max: number,
    rng?: seedrandom.PRNG,
): number => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor((rng?.quick() ?? Math.random()) * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
};

const saveToLocalStorage = (p5: p5Types) => {
    const saveData: LocalStorageData = {
        currentLevel: currentLevel,
        blockProgression: blockProgression,
        blocks: blocks,
    };
    p5.storeItem(localStorageKey, saveData);
};

const loadFromLocalStorage = (p5: p5Types) => {
    const saveData = p5.getItem(localStorageKey) as
        | LocalStorageData
        | undefined
        | null;

    if (saveData) {
        currentLevel = saveData.currentLevel;
        blockProgression = saveData.blockProgression;
        blocks = saveData.blocks;
    }
};

const getBlockBackgroundColor = (p5: p5Types, block: Block): p5Types.Color => {
    switch (block.type) {
        case "wildcard": {
            return p5.color("#FFF");
        }
        case "power": {
            return p5.color(
                colorProgression[block.power % colorProgression.length],
            );
        }
    }
};

const getFormattedBlockText = (block: Block): string => {
    switch (block.type) {
        case "wildcard": {
            return `*${2 ** block.magnitude}`;
        }
        case "power": {
            let symbols = ["", ..."kmgtpezyrq".split("")];
            let scaledPower = block.power;
            if (block.power >= symbols.length * 10) {
                scaledPower = block.power - symbols.length * 10;

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
                    (s, i) =>
                        scaledPower >= i * 10 && scaledPower - i * 10 < 10,
                ) as string;
            const base = 2 ** (scaledPower - 10 * symbols.indexOf(symbol));
            return `${base}${symbol}`;
        }
    }
};

const getNextOpenIndexInColumn = (columnIndex: number): number => {
    return blocks[columnIndex].findIndex((block) => block === null);
};

const addBlockToColumn = (columnIndex: number, block: Block) => {
    const index = getNextOpenIndexInColumn(columnIndex);
    if (index !== -1) {
        blocks[columnIndex][index] = block;
    }
};

const selectNextBlockInProgression = (): Block => {
    if (Math.random() < specialBlockOdds) {
        return { type: "wildcard", magnitude: 1, directions: ["north"] };
    }
    return {
        type: "power",
        power: currentLevel + randRangeInt(0, stepsAboveMinimumToDrop),
    };
};

const advanceBlockProgression = () => {
    blockProgression = [
        ...blockProgression.slice(1),
        selectNextBlockInProgression(),
    ];
};

const getMaxPowerActive = (): number => {
    return blocks.reduce(
        (acc, column) =>
            Math.max(
                acc,
                column.reduce(
                    (acc2, block) =>
                        Math.max(
                            acc2,
                            block?.type === "power" ? block.power : 0,
                        ),
                    0,
                ),
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
            block: subject.block,
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
        const column = blocks[columnIndex];
        for (let index = 0; index < rowCount; index++) {
            const block = column[index];
            if (!block) {
                // there's no block at this position!
                // find the position of the next block above this one
                const nextBlockIndex = column.findIndex(
                    (block, i) => i > index && block,
                );
                if (nextBlockIndex !== -1) {
                    // we have a block and a place to move it
                    didCollapse = true;
                    animLock = true;

                    const newBlock = column[nextBlockIndex] as Block; // we know this is really a block because findIndex found it
                    const fromGrid = [columnIndex, nextBlockIndex];
                    const toGrid = [columnIndex, index];

                    subjects.push({
                        block: newBlock,
                        startGridPos: fromGrid,
                        endGridPos: toGrid,
                        startSize: 1.0,
                        endSize: 1.0,
                    });

                    onFinishFunctions.push(() => {
                        blocks[columnIndex][index] = newBlock;
                    });

                    // post add procedure
                    blocks[columnIndex][nextBlockIndex] = null;
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

const getNewBlockOfMergeGroup = (group: number[][]): Block => {
    const maxPower = group.reduce((acc, loc) => {
        const block = blocks[loc[0]][loc[1]];
        if (block && block.type === "power" && block.power > acc) {
            return block.power;
        }
        return acc;
    }, 0);
    return {
        type: "power",
        power: maxPower + group.length - 1,
    };
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
        const column = blocks[columnIndex];
        for (let index = 0; index < rowCount; index++) {
            const thisBlock = column[index];

            // if this spot is empty, move on
            if (!thisBlock) {
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
            if (index < rowCount - 1) {
                const otherBlock = column[index + 1];
                if (
                    otherBlock &&
                    ((thisBlock.type === "power" &&
                        otherBlock.type === "power" &&
                        otherBlock.power === thisBlock.power) ||
                        (thisBlock.type === "wildcard" &&
                            thisBlock.directions.includes("north") &&
                            otherBlock.type === "power"))
                ) {
                    checkAndAddToGroup(
                        [columnIndex, index],
                        [columnIndex, index + 1],
                    );
                }
            }

            // check east
            if (columnIndex < columnCount - 1) {
                const otherBlock = blocks[columnIndex + 1][index];
                if (
                    otherBlock &&
                    otherBlock.type === "power" &&
                    thisBlock.type === "power" &&
                    otherBlock.power === thisBlock.power
                ) {
                    checkAndAddToGroup(
                        [columnIndex, index],
                        [columnIndex + 1, index],
                    );
                }
            }

            // check south
            if (index > 0) {
                const otherBlock = column[index - 1];
                if (
                    otherBlock &&
                    otherBlock.type === "power" &&
                    thisBlock.type === "power" &&
                    otherBlock.power === thisBlock.power
                ) {
                    checkAndAddToGroup(
                        [columnIndex, index],
                        [columnIndex, index - 1],
                    );
                }
            }

            // check west
            if (columnIndex > 0) {
                const otherBlock = blocks[columnIndex - 1][index];
                if (
                    otherBlock &&
                    otherBlock.type === "power" &&
                    thisBlock.type === "power" &&
                    otherBlock.power === thisBlock.power
                ) {
                    checkAndAddToGroup(
                        [columnIndex, index],
                        [columnIndex - 1, index],
                    );
                }
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
        const newBlock = getNewBlockOfMergeGroup(group);

        for (let index = 0; index < group.length; index++) {
            const loc = group[index];
            if (loc[0] === groupCenter[0] && loc[1] === groupCenter[1]) {
                // we are the group center!
                continue;
            }
            subjects.push({
                block: newBlock,
                startGridPos: loc,
                endGridPos: groupCenter,
                startSize: 1.0,
                endSize: 1.0,
            });
            blocks[loc[0]][loc[1]] = null;
        }

        onFinishFunctions.push(() => {
            blocks[groupCenter[0]][groupCenter[1]] = newBlock;
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

const tryCheckNewcurrentLevel = (p5: p5Types) => {
    // update the minimum power
    const newcurrentLevel = Math.max(
        getMaxPowerActive() - (stepsAboveMinimumToAdvance - 1),
        0,
    );
    if (newcurrentLevel > currentLevel) {
        currentLevel = newcurrentLevel;

        // reset power progression
        blockProgression = blockProgression.map(() =>
            selectNextBlockInProgression(),
        );

        // remove all on-screen blocks below the new minimum
        let activeColumn = 0;
        let removedAnyBlock = false;
        const subjects: AnimGridSubject[] = [];
        for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
            const column = blocks[columnIndex];
            for (let index = 0; index < rowCount; index++) {
                const block = column[index];
                if (block?.type === "power" && block.power < currentLevel) {
                    removedAnyBlock = true;
                    // we'll just set it to whichever one we saw last, because why not
                    activeColumn = columnIndex;
                    // this is the removal animation
                    subjects.push({
                        block: block,
                        startGridPos: [columnIndex, index],
                        endGridPos: [columnIndex + 0.5, index - 0.5],
                        startSize: 1.0,
                        endSize: 0.0,
                    });
                    // just immediately remove it on-record
                    blocks[columnIndex][index] = null;
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
    const theme = useTheme();

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
        block: Block,
        sizeMultiplier = 1.0,
    ) => {
        p5.frameCount;
        if (block) {
            const actualBlockSize = blockSize * sizeMultiplier;
            const blockCenter = [
                x + (sizeMultiplier * blockSize) / 2,
                y + (sizeMultiplier * blockSize) / 2,
            ];

            // draw block background
            const bgColor = getBlockBackgroundColor(p5, block);
            p5.fill(bgColor);
            p5.rect(x, y, actualBlockSize, actualBlockSize, roundingRadius);

            // draw text
            const blockText = getFormattedBlockText(block);
            p5.fill(
                p5.color(
                    theme.palette.getContrastText(bgColor.toString("#rrggbb")),
                ),
            );
            p5.textAlign(p5.CENTER, p5.CENTER);
            p5.textFont(fontString);
            const blockPreSize = maxBlockFontSize * sizeMultiplier;
            p5.textSize(blockPreSize);
            const fontSizeMultiplier = Math.min(
                (actualBlockSize * 0.9) / p5.textWidth(blockText),
                1,
            );
            p5.textSize(blockPreSize * fontSizeMultiplier);
            p5.text(blockText, blockCenter[0], blockCenter[1]);

            // draw wildcard block features
            if (block.type === "wildcard") {
                const triangleHeight = 0.1 * actualBlockSize;
                const triangleWidth = 0.1 * actualBlockSize;

                p5.push();
                p5.translate(blockCenter[0], blockCenter[1]);
                if (block.directions.includes("north")) {
                    const a = [0, -actualBlockSize * 0.4];
                    const b = [a[0] - triangleWidth / 2, a[1] + triangleHeight];
                    const c = [a[0] + triangleWidth / 2, a[1] + triangleHeight];
                    p5.fill(p5.color("#000"));
                    p5.triangle(a[0], a[1], b[0], b[1], c[0], c[1]);
                    p5.rotate(p5.HALF_PI); // 90 degrees
                }
                p5.pop();
            }
        }
    };

    const drawPowerBlockAtGridLocation = (
        p5: p5Types,
        x: number,
        y: number,
        block: Block,
        sizeMultiplier = 1.0,
    ) => {
        const [actualX, actualY] = actualCoordinatesFromGrid([x, y]);
        drawPowerBlock(p5, actualX, actualY, block, sizeMultiplier);
    };

    const mouseClicked = (p5: p5Types) => {
        if (gameOver) {
            resetGame();
            return;
        }
        for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
            if (
                !animLock &&
                mouseIsOverColumnRect(p5, columnIndex) &&
                blocks[columnIndex].some((block) => !block)
            ) {
                animLock = true;
                const endGridPosY = getNextOpenIndexInColumn(columnIndex);

                const newBlock = blockProgression[0];
                const fromGrid = [columnIndex, 5];
                const toGrid = [columnIndex, endGridPosY];

                const blockProgressionCopy = blockProgression.slice();
                // advancePowerProgression();
                blockProgression = [];
                // powerProgression[powerProgressionCopy.length - 1] =
                addBlockAnimation(
                    p5,
                    [
                        // the block we are adding
                        {
                            block: newBlock,
                            startGridPos: fromGrid,
                            endGridPos: toGrid,
                            startSize: 1.0,
                            endSize: 1.0,
                        },
                        // the power progression indicator block
                        {
                            block: blockProgressionCopy[1],
                            startGridPos: [2.5, 6],
                            endGridPos: [1.5, 6],
                            startSize: 0.8,
                            endSize: 1.0,
                        },
                    ],
                    newBlockAnimationDurationMillis,
                    newBlockAnimationCurveFunction,
                    () => {
                        addBlockToColumn(columnIndex, newBlock);
                        blockProgression = blockProgressionCopy;
                        advanceBlockProgression();
                        animLock = false;
                        tryCheckMergeSingleStep(p5, columnIndex, () => {
                            tryCheckNewcurrentLevel(p5);
                            saveToLocalStorage(p5);
                        });
                    },
                );
            }
        }
    };

    const setup = (p5: p5Types, canvasParentRef: Element) => {
        if (!ranSetup) {
            p5.createCanvas(width, height).parent(canvasParentRef);
            p5.frameRate(144);
            loadFromLocalStorage(p5);
            ranSetup = true; // for some reason this is necessary? otherwise it creates two canvasses. no idea why
        }
    };

    const draw = (p5: p5Types) => {
        // set the background color to black
        p5.background(p5.color("#000"));

        // draw the level
        const levelText = `Lvl ${currentLevel}`;
        p5.fill(p5.color("#FFF"));
        p5.textAlign(p5.LEFT, p5.TOP);
        p5.textSize(28 * scalar);
        p5.textFont(fontString);
        p5.text(levelText, 10 * scalar, 10 * scalar);

        // draw the current powerblock progression
        drawPowerBlockAtGridLocation(p5, 1.5, 6, blockProgression[0]);
        drawPowerBlockAtGridLocation(p5, 2.5, 6, blockProgression[1], 0.8);

        // draw the goal powerblock for reference
        p5.fill(p5.color("#FFF"));
        p5.textAlign(p5.RIGHT, p5.TOP);
        p5.textSize(20 * scalar);
        p5.textFont(fontString);
        const textCoords = actualCoordinatesFromGrid([4.4, 5.9]);
        p5.text("goal:", textCoords[0], textCoords[1]);
        drawPowerBlockAtGridLocation(
            p5,
            4.5,
            6,
            { type: "power", power: currentLevel + stepsAboveMinimumToAdvance },
            0.5,
        );

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
                const block = blocks[columnIndex][index];
                if (block) {
                    drawPowerBlockAtGridLocation(p5, columnIndex, index, block);
                }
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
                drawPowerBlock(p5, x, y, subject.block, size);
            });

            if (p5.frameCount >= animation.endTime) {
                animation.onFinish?.();
            }
        });

        // check gameover conditions
        if (
            runningAnimations.length === 0 && // nothing is moving
            blocks.flat(1).every((block) => block) // and all slots are full
        ) {
            // you lose!
            gameOver = true;
        }

        // write gameover graphics
        if (gameOver) {
            // box
            p5.fill(p5.color("#000E"));
            p5.rect(20, 20, width - 40, height - 40, 10);

            // game over!
            p5.textAlign(p5.CENTER);
            p5.fill(p5.color("#FFF"));
            p5.textSize(42);
            p5.text("Game Over!", 30, 30, width - 60, 30 + 100);

            // final score
            p5.textAlign(p5.CENTER);
            p5.fill(p5.color("#FFF"));
            p5.textSize(28);
            p5.text(`Highest level: ${currentLevel}`, 30, 200, width - 60, 200);

            // restart text
            p5.textAlign(p5.CENTER);
            p5.fill(p5.color("#FFF"));
            p5.textSize(36);
            p5.text(
                "Click or touch anywhere to restart",
                30,
                500,
                width - 60,
                200,
            );
        }
    };

    return <Sketch setup={setup} draw={draw} mouseClicked={mouseClicked} />;
};

export default MergeMania;
