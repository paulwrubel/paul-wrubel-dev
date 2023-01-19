import { useState } from "react";

import { Box, Button, Slider, Typography } from "@mui/material";

import { BezierCurve, Point } from "./BezierCurve";
import BezierSketch from "./BezierSketch";

const width = Math.min(1000, window.innerWidth - 10);
const height = 600;

const Bezier = () => {
    const [curve, setCurve] = useState<BezierCurve>(
        new BezierCurve(
            { x: 50, y: height - 50 }, // bottom left
            { x: 50, y: 50 }, // top left
            { x: width - 50, y: 50 }, // top right
            { x: width - 50, y: height - 50 }, // bottom right
        ),
    );

    const [t, setT] = useState<number>(0.5);
    const [approximationSegments, setApproximationSegments] =
        useState<number>(50);

    const handleTChange = (_: Event, newValue: number | number[]) => {
        setT(newValue as number);
    };

    const handleApproximationSegmentsChange = (
        _: Event,
        newValue: number | number[],
    ) => {
        setApproximationSegments(newValue as number);
    };

    const handleAddPoint = () => {
        const currentPoints = curve.points;
        const newPoint =
            currentPoints.length < 2
                ? {
                      x: width / 2,
                      y: height / 2,
                  }
                : {
                      x:
                          ((currentPoints.at(-1) as Point).x +
                              (currentPoints.at(-2) as Point).x) /
                          2,
                      y:
                          ((currentPoints.at(-1) as Point).y +
                              (currentPoints.at(-2) as Point).y) /
                          2,
                  };
        currentPoints.splice(-1, 0, newPoint);
        setCurve(new BezierCurve(...currentPoints));
    };

    const handleRemovePoint = () => {
        const currentPoints = curve.points;
        if (currentPoints.length > 2) {
            currentPoints.splice(-2, 1);
            setCurve(new BezierCurve(...currentPoints));
        }
    };

    return (
        <>
            <BezierSketch
                width={width}
                height={height}
                curve={curve}
                t={t}
                approximationSegments={approximationSegments}
            />
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    m: 1,
                    p: 1,
                    gap: 1,
                }}
            >
                <Typography
                    id="t-typography"
                    fontFamily='"Source Code Pro", monospace'
                >
                    t: {t}
                </Typography>
                <Slider
                    value={t}
                    onChange={handleTChange}
                    min={0}
                    max={1}
                    step={0.001}
                    valueLabelDisplay="auto"
                    aria-labelledby="t-typography"
                />
                <Typography
                    id="t-typography"
                    fontFamily='"Source Code Pro", monospace'
                >
                    # segments: {approximationSegments}
                </Typography>
                <Slider
                    value={approximationSegments}
                    onChange={handleApproximationSegmentsChange}
                    min={1}
                    max={80}
                    step={1}
                    valueLabelDisplay="auto"
                    aria-labelledby="approximation-segments-typography"
                />
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-evenly",
                        width: 1,
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={handleAddPoint}
                        sx={{
                            fontFamily: '"Source Code Pro", monospace',
                        }}
                    >
                        add point
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleRemovePoint}
                        sx={{
                            fontFamily: '"Source Code Pro", monospace',
                        }}
                    >
                        remove point
                    </Button>
                </Box>
            </Box>
        </>
    );
};

export default Bezier;
