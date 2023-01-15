import { useEffect, useState } from "react";

import { Box } from "@mui/material";

import { keyframes } from "@emotion/react";
import seedrandom from "seedrandom";

function randRangeInt(min: number, max: number, rng?: seedrandom.PRNG): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor((rng?.quick() ?? Math.random()) * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

const getBackgroundColorFromNum = (n: number): string => {
    const rng = seedrandom(`b${n}`);
    return `hsl(${randRangeInt(0, 360, rng)} ${randRangeInt(
        50,
        100,
        rng,
    )}% ${randRangeInt(50, 70, rng)}%)`;
};

const PowerBlock = ({ power, size }: { power: number; size: number }) => {
    return (
        <Box
            sx={{
                width: size,
                height: size,

                display: "flex",
                justifyContent: "center",
                alignItems: "center",

                backgroundColor: getBackgroundColorFromNum(2 ** power),
                borderRadius: "8px",

                userSelect: "none",
                fontSize: "3rem",
                // fontWeight: "200",
                fontFamily: '"Source Code Pro", monospace',
            }}
        >
            {2 ** power}
        </Box>
    );
};

const MergeManiaProto = () => {
    const columns = 5;
    const rows = 6;
    const blockSize = 100;

    const [animating, setAnimating] = useState(false);

    const [minimumPower, setMinimumPower] = useState(0);
    const [currentPowerProgression, setCurrentPowerProgression] = useState<
        number[]
    >([0, 0]);

    const [columnPowers, setColumnPowers] = useState<number[][]>(
        [...Array(columns)].map(() => []),
    );

    // const collapseStep = (c: number[]): { c: number[]; collapsed: boolean } => {
    //     const collapsedArray: number[] = [];
    //     let collapsed = false;
    //     for (let i = 0; i < c.length; i++) {
    //         if (i < c.length - 1 && c[i + 1] === c[i]) {
    //             collapsedArray.push(c[i] + 1);
    //             i++;
    //             collapsed = true;
    //         } else {
    //             collapsedArray.push(c[i]);
    //         }
    //     }
    //     return { c: collapsedArray, collapsed: collapsed };
    // };

    // const collapseColumnStep = (ci: number) => {
    //     const columnPowersCopy = columnPowers.slice();

    //     const startingColumn = columnPowersCopy[ci];
    //     const collapsedColumn: number[] = [];
    //     let collapsed = false;
    //     for (let i = 0; i < startingColumn.length; i++) {
    //         if (
    //             i < startingColumn.length - 1 &&
    //             startingColumn[i + 1] === startingColumn[i]
    //         ) {
    //             collapsedColumn.push(startingColumn[i] + 1);
    //             i++;
    //             collapsed = true;
    //         } else {
    //             collapsedColumn.push(startingColumn[i]);
    //         }
    //     }

    //     columnPowersCopy[ci] = collapsedColumn;
    //     setColumnPowers(columnPowersCopy);
    // };

    // const collapse = (column: number[]): number[] => {
    //     let { collapsed, c } = collapseStep(column);
    //     while (collapsed) {
    //         ({ collapsed, c } = collapseStep(c));
    //     }
    //     return c;
    // };

    const addBlock = (ci: number, p: number) => {
        const columnPowersCopy = columnPowers.slice();
        columnPowersCopy[ci].push(p);
        setAnimating(true);
        // columnPowersCopy[ci] = collapse(columnPowersCopy[ci]);
        setColumnPowers(columnPowersCopy);
        setCurrentPowerProgression([
            ...currentPowerProgression.slice(1),
            minimumPower + randRangeInt(0, 2),
        ]);
    };

    // const getCollapsibleColumns = (): number[] => {
    //     const collapsibleColumns: number[] = [];
    //     columnPowers.forEach((column, ci) => {
    //         let isCollapsible = false;
    //         column.forEach((_, i) => {
    //             if (i < column.length - 1 && column[i + 1] === column[i]) {
    //                 isCollapsible = true;
    //             }
    //         });
    //         if (isCollapsible) {
    //             collapsibleColumns.push(ci);
    //         }
    //     });
    //     return collapsibleColumns;
    // };

    const tryCollapseAll = (): boolean => {
        // TODO: collapses occur sideways as well!
        const columnPowersCopy = columnPowers.slice().map((c) => c.slice());
        let didCollapse = false;
        for (let ci = 0; ci < columnPowersCopy.length; ci++) {
            const column = columnPowersCopy[ci];
            for (let i = 0; i < column.length; i++) {
                const matchesAbove =
                    i < column.length - 1 && column[i] === column[i + 1];
                const matchesRight =
                    ci < columnPowersCopy.length - 1 &&
                    columnPowersCopy[ci + 1].length > i &&
                    column[i] === columnPowersCopy[ci + 1][i];
                if (matchesAbove) {
                    columnPowersCopy[ci].splice(i, 2, column[i] + 1);
                    didCollapse = true;
                }
                if (matchesRight) {
                    columnPowersCopy[ci].splice(i, 1, column[i] + 1);
                    columnPowersCopy[ci + 1].splice(i, 1);
                    didCollapse = true;
                }
            }
        }
        if (didCollapse) {
            setColumnPowers(columnPowersCopy);
        }
        return didCollapse;
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

    useEffect(() => {
        if (animating) {
            setTimeout(() => {
                if (animating) {
                    setAnimating(false);
                }
            }, 500);
        } else {
            const didCollapse = tryCollapseAll();
            // const collapsibleColumns = getCollapsibleColumns();
            // collapsibleColumns.forEach((ci) => {
            //     // setAnimating(true);
            //     collapseColumnStep(ci);
            // });
            if (didCollapse) {
                const newMinPower = Math.max(getMaxPowerActive() - 5, 0);
                setMinimumPower(newMinPower);
                setAnimating(true);
            }
            // collapseColumn(0);
        }
    }, [animating]);

    return (
        <Box
            sx={{
                alignSelf: "center",
                outline: "solid 1px #333",
                backgroundColor: "#000",
            }}
        >
            <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Box
                    sx={{
                        width: 1,
                        height: blockSize,

                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",

                        // p: 1,
                        gap: 1,
                    }}
                >
                    <PowerBlock
                        size={blockSize}
                        power={currentPowerProgression[0]}
                    />
                    <PowerBlock
                        size={blockSize * 0.8}
                        power={currentPowerProgression[1]}
                    />
                </Box>
                <Box
                    sx={{
                        width: 1,
                        height: 1,
                        p: 1,
                        gap: 1,
                        display: "flex",
                        alignItems: "stretch",
                        justifyContent: "space-between",
                    }}
                >
                    {[...Array(columns).keys()].map((columnIndex) => (
                        <Box
                            key={columnIndex}
                            sx={{
                                width: blockSize,
                                height: blockSize * rows,

                                display: "flex",
                                flexDirection: "column-reverse",
                                justifyContent: "flex-start",

                                backgroundColor: "#222",
                                borderRadius: "8px",
                                ":hover": {
                                    backgroundColor: "#333",
                                },
                            }}
                            onClick={() => {
                                if (columnPowers[columnIndex].length < 6) {
                                    addBlock(
                                        columnIndex,
                                        currentPowerProgression[0],
                                    );
                                }
                            }}
                        >
                            {columnPowers[columnIndex].map((p, i, a) => {
                                const box = (
                                    <PowerBlock
                                        key={`${i}@c${columnIndex}`}
                                        size={blockSize}
                                        power={p}
                                    />
                                );

                                if (i === a.length - 1) {
                                    return (
                                        <Box
                                            key={`${i}@c${columnIndex}`}
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",

                                                height: "100px",
                                                animationName: `${keyframes({
                                                    from: {
                                                        marginBottom:
                                                            600 -
                                                            100 * a.length,
                                                    },
                                                    to: {
                                                        marginBottom: 0,
                                                    },
                                                })}`,
                                                animationDuration: "0.5s",
                                                animationTimingFunction:
                                                    "cubic-bezier(0,1,0,1)",
                                                animationFillMode: "forwards",
                                            }}
                                        >
                                            {box}
                                        </Box>
                                    );
                                }
                                return box;
                            })}
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default MergeManiaProto;
