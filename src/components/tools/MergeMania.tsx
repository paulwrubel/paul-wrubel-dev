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
    startPos: Location;
    endPos: Location;
    startSize: number;
    endSize: number;
};

type AnimGridSubject = {
    block: Block;
    startGridPos: Location;
    endGridPos: Location;
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

type Location = {
    x: number;
    y: number;
};

type PowerBlock = {
    type: "power";
    power: number;
};

type CardinalDirection = "north" | "south" | "east" | "west";

type WildcardBlock = {
    type: "wildcard";
    magnitude: number;
    directions: CardinalDirection[];
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

const specialBlockOdds = 0.03;
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
const stepsAboveMinimumToAdvance = 9;
const stepsAboveMinimumToDrop = 4;

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

const randomCherryPickFromArray = <T,>(array: T[], quantity: number): T[] => {
    if (quantity < 1) {
        return [];
    }

    const randIndex = randRangeInt(0, array.length - 1);
    const cherryPick = array[randIndex];

    const subtractedArray = array.slice();
    subtractedArray.splice(randIndex, 1);

    return [
        cherryPick,
        ...randomCherryPickFromArray(subtractedArray, quantity - 1),
    ];
};

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
            // return p5.color("#FFF");
            return p5.color(
                colorProgression[block.magnitude % colorProgression.length],
            );
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
            return `${2 ** block.magnitude}`;
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

const getNextOpenIndexInColumn = (x: number): number => {
    return blocks[x].findIndex((block) => block === null);
};

const addBlockToColumn = (x: number, block: Block) => {
    const y = getNextOpenIndexInColumn(x);
    if (y !== -1) {
        blocks[x][y] = block;
    }
};

const selectNextBlockInProgression = (): Block => {
    if (Math.random() < specialBlockOdds) {
        const magSample = Math.random();
        const magnitude = magSample < 0.6 ? 0 : magSample < 0.9 ? 1 : 2;
        return {
            type: "wildcard",
            magnitude: magnitude,
            directions: randomCherryPickFromArray(
                ["north", "south", "east", "west"],
                randRangeInt(1, 4),
            ),
        };
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

const actualLocationFromGrid = ({ x, y }: Location): Location => {
    return {
        x: padding + padding * x + blockSize * x,
        y: height - (padding * (y + 1) + blockSize * (y + 1)),
    };
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
            startPos: actualLocationFromGrid(subject.startGridPos),
            endPos: actualLocationFromGrid(subject.endGridPos),
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
    for (let x = 0; x < columnCount; x++) {
        const column = blocks[x];
        for (let y = 0; y < rowCount; y++) {
            const block = column[y];
            if (!block) {
                // there's no block at this position!
                // find the position of the next block above this one
                const nextBlockY = column.findIndex(
                    (block, i) => i > y && block,
                );
                if (nextBlockY !== -1) {
                    // we have a block and a place to move it
                    didCollapse = true;
                    animLock = true;

                    const newBlock = column[nextBlockY] as Block; // we know this is really a block because findIndex found it
                    const fromGrid = { x: x, y: nextBlockY };
                    const toGrid = { x: x, y: y };

                    subjects.push({
                        block: newBlock,
                        startGridPos: fromGrid,
                        endGridPos: toGrid,
                        startSize: 1.0,
                        endSize: 1.0,
                    });

                    onFinishFunctions.push(() => {
                        blocks[x][y] = newBlock;
                    });

                    // post add procedure
                    blocks[x][nextBlockY] = null;
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
                tryCheckMerge(p5, activeColumn, false, onAnimChainFinished);
            },
        );
    } else {
        tryCheckMerge(p5, activeColumn, false, onAnimChainFinished);
    }
};

const getNewBlockOfMergeGroup = (group: Location[]): Block => {
    const maxPower = group.reduce((acc, { x, y }) => {
        const block = blocks[x][y];
        if (block?.type === "power" && block.power > acc) {
            return block.power;
        }
        return acc;
    }, 0);
    const maxMagnitude = group.reduce((acc, { x, y }) => {
        const block = blocks[x][y];
        if (block?.type === "wildcard" && block.magnitude > acc) {
            return block.magnitude;
        }
        return acc;
    }, 0);
    return {
        type: "power",
        power: maxPower + maxMagnitude + group.length - 1,
    };
};

const areAdjacent = (
    { x: x1, y: y1 }: Location,
    { x: x2, y: y2 }: Location,
): boolean => {
    return (
        (Math.abs(x1 - x2) === 1 && Math.abs(y1 - y2) === 0) ||
        (Math.abs(x1 - x2) === 0 && Math.abs(y1 - y2) === 1)
    );
};

const getCenterOfMergeGroup = (
    group: Location[],
    activeColumn: number,
): Location => {
    if (group.length === 2) {
        if (group[0].x === group[1].x) {
            // same x coordinate, so these are vertically stacked
            // we should return the one on bottom
            return group[0].y < group[1].y ? group[0] : group[1];
        } else {
            // these must be horizontal
            // we should return the one closest to the active column
            return Math.abs(group[0].x - activeColumn) <
                Math.abs(group[1].x - activeColumn)
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

// helper function
// check if this location is in some group already
// and return that group's index if it is
const checkAndAddToInteractionGroup = (
    mergeGroups: Location[][],
    current: Location,
    match: Location,
) => {
    const newMergeGroups = mergeGroups.slice().map((g) => g.slice());
    const currentGroupIndex = mergeGroups.findIndex((group) =>
        group.some(({ x, y }) => x === current.x && y === current.y),
    );
    const matchGroupIndex = mergeGroups.findIndex((group) =>
        group.some(({ x, y }) => x === match.x && y === match.y),
    );
    if (currentGroupIndex === -1 && matchGroupIndex !== -1) {
        // match is in a group, so add current to that group
        newMergeGroups[matchGroupIndex].push(current);
    } else if (currentGroupIndex !== -1 && matchGroupIndex === -1) {
        // current is in a group, so add match to that group
        newMergeGroups[currentGroupIndex].push(match);
    } else if (currentGroupIndex === -1 && matchGroupIndex === -1) {
        // neither are in any group, so add a new group with both of them
        newMergeGroups.push([current, match]);
    }
    return newMergeGroups;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
const findSpecialMergeGroups = (): Location[][] => {
    let specialMergeGroups: Location[][] = [];
    for (let x = 0; x < columnCount; x++) {
        const column = blocks[x];
        for (let y = 0; y < rowCount; y++) {
            const thisBlock = column[y];

            // if this spot is empty or not a wildcard, move on
            if (!thisBlock || thisBlock.type !== "wildcard") {
                continue;
            }

            // check north
            if (y < rowCount - 1 && thisBlock.directions.includes("north")) {
                const otherBlock = column[y + 1];
                if (otherBlock?.type === "power") {
                    specialMergeGroups = checkAndAddToInteractionGroup(
                        specialMergeGroups,
                        { x: x, y: y },
                        { x: x, y: y + 1 },
                    );
                }
            }

            // check east
            if (x < columnCount - 1 && thisBlock.directions.includes("east")) {
                const otherBlock = blocks[x + 1][y];
                if (otherBlock?.type === "power") {
                    specialMergeGroups = checkAndAddToInteractionGroup(
                        specialMergeGroups,
                        { x: x, y: y },
                        { x: x + 1, y: y },
                    );
                }
            }

            // check south
            if (y > 0 && thisBlock.directions.includes("south")) {
                const otherBlock = column[y - 1];
                if (otherBlock?.type === "power") {
                    specialMergeGroups = checkAndAddToInteractionGroup(
                        specialMergeGroups,
                        { x: x, y: y },
                        { x: x, y: y - 1 },
                    );
                }
            }

            // check west
            if (x > 0 && thisBlock.directions.includes("west")) {
                const otherBlock = blocks[x - 1][y];
                if (otherBlock?.type === "power") {
                    specialMergeGroups = checkAndAddToInteractionGroup(
                        specialMergeGroups,
                        { x: x, y: y },
                        { x: x - 1, y: y },
                    );
                }
            }
        }
    }
    return specialMergeGroups;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
const findMergeGroups = (): Location[][] => {
    let mergeGroups: Location[][] = [];
    for (let x = 0; x < columnCount; x++) {
        const column = blocks[x];
        for (let y = 0; y < rowCount; y++) {
            const thisBlock = column[y];

            // if this spot is empty or not a powerblock, move on
            if (!thisBlock || thisBlock.type !== "power") {
                continue;
            }

            // check north
            if (y < rowCount - 1) {
                const otherBlock = column[y + 1];
                if (
                    otherBlock?.type === "power" &&
                    otherBlock.power === thisBlock.power
                ) {
                    mergeGroups = checkAndAddToInteractionGroup(
                        mergeGroups,
                        { x: x, y: y },
                        { x: x, y: y + 1 },
                    );
                }
            }

            // check east
            if (x < columnCount - 1) {
                const otherBlock = blocks[x + 1][y];
                if (
                    otherBlock?.type === "power" &&
                    otherBlock.power === thisBlock.power
                ) {
                    mergeGroups = checkAndAddToInteractionGroup(
                        mergeGroups,
                        { x: x, y: y },
                        { x: x + 1, y: y },
                    );
                }
            }

            // check south
            if (y > 0) {
                const otherBlock = column[y - 1];
                if (
                    otherBlock?.type === "power" &&
                    otherBlock.power === thisBlock.power
                ) {
                    mergeGroups = checkAndAddToInteractionGroup(
                        mergeGroups,
                        { x: x, y: y },
                        { x: x, y: y - 1 },
                    );
                }
            }

            // check west
            if (x > 0) {
                const otherBlock = blocks[x - 1][y];
                if (
                    otherBlock?.type === "power" &&
                    otherBlock.power === thisBlock.power
                ) {
                    mergeGroups = checkAndAddToInteractionGroup(
                        mergeGroups,
                        { x: x, y: y },
                        { x: x - 1, y: y },
                    );
                }
            }
        }
    }
    return mergeGroups;
};

const tryCheckMerge = (
    p5: p5Types,
    activeColumn: number,
    checkSpecial?: boolean,
    onAnimChainFinished?: () => void,
    // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
    const mergeGroups: Location[][] = checkSpecial
        ? findSpecialMergeGroups()
        : findMergeGroups();

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
            const { x, y } = group[index];
            if (x === groupCenter.x && y === groupCenter.y) {
                // we are the group center!
                continue;
            }
            subjects.push({
                block: newBlock,
                startGridPos: { x, y },
                endGridPos: groupCenter,
                startSize: 1.0,
                endSize: 1.0,
            });
            blocks[x][y] = null;
        }

        onFinishFunctions.push(() => {
            blocks[groupCenter.x][groupCenter.y] = newBlock;
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
    } else if (!checkSpecial) {
        tryCheckMerge(p5, activeColumn, true, onAnimChainFinished);
    } else {
        onAnimChainFinished?.();
    }
};

const isWildcardBlockPositionValid = ({ x, y }: Location): boolean => {
    const block = blocks[x][y];
    if (block?.type !== "wildcard") {
        return true;
    }

    let hasValidMergeOption = false;
    // check north
    if (block.directions.includes("north")) {
        // blocks can always fall to make room
        // or have other blocks placed on top of them
        // so north is never an invalid option
        hasValidMergeOption = true;
    }
    // check south
    if (block.directions.includes("south") && y !== 0) {
        // this block isn't on the bottom row
        // so, while unlikely if hasn't already,
        // it still can technically merge
        hasValidMergeOption = true;
    }
    // check east
    if (block.directions.includes("east") && x !== columnCount - 1) {
        // this block isn't in the rightmost column
        // so it can definitely merge
        hasValidMergeOption = true;
    }
    // check west
    if (block.directions.includes("west") && x !== 0) {
        // this block isn't in the leftmost column
        // so it can definitely merge
        hasValidMergeOption = true;
    }
    return hasValidMergeOption;
};

const getWildcardBlocksInClosedLoop = (): Location[] => {
    let connectedSpecialGroups: Location[][] = [];
    for (let x = 0; x < columnCount; x++) {
        const column = blocks[x];
        for (let y = 0; y < rowCount; y++) {
            const thisBlock = column[y];

            // if this spot is empty or not a wildcard block, move on
            if (!thisBlock || thisBlock.type !== "wildcard") {
                continue;
            }

            // if we face a wall, we are invalid
            if (!isWildcardBlockPositionValid({ x: x, y: y })) {
                const currentGroupIndex = connectedSpecialGroups.findIndex(
                    (group) =>
                        group.some(
                            ({ x: groupX, y: groupY }) =>
                                groupX === x && groupY === y,
                        ),
                );
                // only add to a new group if we aren't already in one
                // we could be in one because a block pointing at us may have added us
                if (currentGroupIndex === -1) {
                    connectedSpecialGroups.push([{ x: x, y: y }]);
                }
            }

            // check north
            if (y < rowCount - 1) {
                const otherBlock = column[y + 1];
                if (
                    otherBlock?.type === "wildcard" &&
                    (thisBlock.directions.includes("north") ||
                        otherBlock.directions.includes("south"))
                ) {
                    connectedSpecialGroups = checkAndAddToInteractionGroup(
                        connectedSpecialGroups,
                        { x: x, y: y },
                        { x: x, y: y + 1 },
                    );
                }
            }

            // check east
            if (x < columnCount - 1) {
                const otherBlock = blocks[x + 1][y];
                if (
                    otherBlock?.type === "wildcard" &&
                    (thisBlock.directions.includes("east") ||
                        otherBlock.directions.includes("west"))
                ) {
                    connectedSpecialGroups = checkAndAddToInteractionGroup(
                        connectedSpecialGroups,
                        { x: x, y: y },
                        { x: x + 1, y: y },
                    );
                }
            }

            // check south
            if (y > 0) {
                const otherBlock = column[y - 1];
                if (
                    otherBlock?.type === "wildcard" &&
                    (thisBlock.directions.includes("south") ||
                        otherBlock.directions.includes("north"))
                ) {
                    connectedSpecialGroups = checkAndAddToInteractionGroup(
                        connectedSpecialGroups,
                        { x: x, y: y },
                        { x: x, y: y - 1 },
                    );
                }
            }

            // check west
            if (x > 0) {
                const otherBlock = blocks[x - 1][y];
                if (
                    otherBlock?.type === "wildcard" &&
                    (thisBlock.directions.includes("west") ||
                        otherBlock.directions.includes("east"))
                ) {
                    connectedSpecialGroups = checkAndAddToInteractionGroup(
                        connectedSpecialGroups,
                        { x: x, y: y },
                        { x: x - 1, y: y },
                    );
                }
            }
        }
    }

    const closedSpecialGroups: Location[][] = [];
    connectedSpecialGroups.forEach((group) => {
        let groupIsValid = false;
        for (let i = 0; i < group.length; i++) {
            const { x, y } = group[i];
            const thisBlock = blocks[x][y] as WildcardBlock;

            // check north
            if (y < rowCount - 1 && thisBlock.directions.includes("north")) {
                const otherBlock = blocks[x][y + 1];
                if (otherBlock === null || otherBlock.type !== "wildcard") {
                    groupIsValid = true;
                    break;
                }
            }

            // check east
            if (x < columnCount - 1 && thisBlock.directions.includes("east")) {
                const otherBlock = blocks[x + 1][y];
                if (otherBlock === null || otherBlock.type !== "wildcard") {
                    groupIsValid = true;
                    break;
                }
            }

            // check south
            if (y > 0 && thisBlock.directions.includes("south")) {
                const otherBlock = blocks[x][y - 1];
                if (otherBlock === null || otherBlock.type !== "wildcard") {
                    groupIsValid = true;
                    break;
                }
            }

            // check west
            if (x > 0 && thisBlock.directions.includes("west")) {
                const otherBlock = blocks[x - 1][y];
                if (otherBlock === null || otherBlock.type !== "wildcard") {
                    groupIsValid = true;
                    break;
                }
            }
        }
        if (!groupIsValid) {
            closedSpecialGroups.push(group.slice());
        }
    });

    return closedSpecialGroups.flat();
};

const tryCheckRemoveInvalidBlocks = (
    p5: p5Types,
    onAnimChainFinished: () => void,
) => {
    // remove all on-screen blocks that are considered "invalid"
    // these include:
    // - power blocks below the minimum power
    // - wildcard blocks in a closed chain
    const blocksToRemove: Location[] = [];

    const invalidWildcardBlocks: Location[] = getWildcardBlocksInClosedLoop();
    blocksToRemove.push(...invalidWildcardBlocks);

    for (let x = 0; x < columnCount; x++) {
        const column = blocks[x];
        for (let y = 0; y < rowCount; y++) {
            const block = column[y];
            if (
                block?.type === "power" &&
                block.power < currentLevel
                // ||
                // (block?.type === "wildcard" &&
                //     !isWildcardBlockPositionValid({ x: x, y: y }))
            ) {
                blocksToRemove.push({ x: x, y: y });
            }
        }
    }

    let activeColumn = 0;
    const subjects: AnimGridSubject[] = [];

    blocksToRemove.forEach(({ x, y }) => {
        const block = blocks[x][y] as Block;
        // we'll just set it to whichever one we saw last, because why not
        activeColumn = x;
        // this is the removal animation
        subjects.push({
            block: block,
            startGridPos: { x: x, y: y },
            endGridPos: { x: x + 0.5, y: y - 0.5 },
            startSize: 1.0,
            endSize: 0.0,
        });
        // just immediately remove it on-record
        blocks[x][y] = null;
    });

    if (blocksToRemove.length > 0) {
        animLock = true;
        addBlockAnimation(
            p5,
            subjects,
            removeBlockAnimationDurationMillis,
            removeBlockAnimationCurveFunction,
            () => {
                animLock = false;
                tryCheckCollapse(p5, activeColumn, onAnimChainFinished);
            },
        );
    }
};

const tryCheckNewLevel = () => {
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
    }
};

const getHandleAnimChainFinished = (p5: p5Types): (() => void) => {
    return () => {
        tryCheckNewLevel();
        tryCheckRemoveInvalidBlocks(p5, getHandleAnimChainFinished(p5));
        saveToLocalStorage(p5);
    };
};

const MergeMania = () => {
    const theme = useTheme();

    const mouseIsOverColumnRect = (p5: p5Types, gridX: number): boolean => {
        const topLeft = [
            padding * (gridX + 1) + gridX * blockSize,
            blockSize + padding * 2,
        ];
        const bottomRight = [
            padding * (gridX + 1) + gridX * blockSize + blockSize,
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
            let bgColor = getBlockBackgroundColor(p5, block);
            p5.fill(bgColor);
            p5.rect(x, y, actualBlockSize, actualBlockSize, roundingRadius);

            if (block.type === "wildcard") {
                bgColor = p5.color("#FFF"); // the REAL background color!
                const innerBlockSize = actualBlockSize * 0.8;
                p5.push();
                p5.stroke(p5.color("#FFF"));
                p5.fill(bgColor);
                p5.rect(
                    x + (actualBlockSize - innerBlockSize) / 2,
                    y + (actualBlockSize - innerBlockSize) / 2,
                    innerBlockSize,
                    innerBlockSize,
                    roundingRadius * 0.8,
                );
                p5.pop();
            }

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
                (
                    ["north", "east", "south", "west"] as CardinalDirection[]
                ).forEach((dir) => {
                    if (block.directions.includes(dir)) {
                        const a = [0, -actualBlockSize * 0.4];
                        const b = [
                            a[0] - triangleWidth / 2,
                            a[1] + triangleHeight,
                        ];
                        const c = [
                            a[0] + triangleWidth / 2,
                            a[1] + triangleHeight,
                        ];
                        p5.fill(p5.color("#000"));
                        p5.triangle(a[0], a[1], b[0], b[1], c[0], c[1]);
                    }
                    p5.rotate(p5.HALF_PI); // 90 degrees
                });
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
        const { x: actualX, y: actualY } = actualLocationFromGrid({
            x: x,
            y: y,
        });
        drawPowerBlock(p5, actualX, actualY, block, sizeMultiplier);
    };

    const mouseClicked = (p5: p5Types) => {
        if (gameOver) {
            resetGame();
            return;
        }
        for (let x = 0; x < columnCount; x++) {
            if (
                !animLock &&
                mouseIsOverColumnRect(p5, x) &&
                blocks[x].some((block) => !block)
            ) {
                animLock = true;
                const endGridPosY = getNextOpenIndexInColumn(x);

                const newBlock = blockProgression[0];
                const fromGrid = { x: x, y: 5 };
                const toGrid = { x: x, y: endGridPosY };

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
                            startGridPos: { x: 2.5, y: 6 },
                            endGridPos: { x: 1.5, y: 6 },
                            startSize: 0.8,
                            endSize: 1.0,
                        },
                    ],
                    newBlockAnimationDurationMillis,
                    newBlockAnimationCurveFunction,
                    () => {
                        addBlockToColumn(x, newBlock);
                        blockProgression = blockProgressionCopy;
                        advanceBlockProgression();
                        animLock = false;
                        tryCheckMerge(
                            p5,
                            x,
                            false,
                            getHandleAnimChainFinished(p5),
                        );
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
        const { x: textX, y: textY } = actualLocationFromGrid({
            x: 4.4,
            y: 5.9,
        });
        p5.text("goal:", textX, textY);
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
                    subject.startPos.x,
                    subject.endPos.x,
                );
                const y = p5.map(
                    progression,
                    0,
                    1,
                    subject.startPos.y,
                    subject.endPos.y,
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
