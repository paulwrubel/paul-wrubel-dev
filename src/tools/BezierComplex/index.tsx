import { useState } from "react";

import {
    Box,
    Button,
    FormControlLabel,
    Slider,
    Switch,
    Typography,
} from "@mui/material";

import { ComplexBezierCurve } from "toolhelpers/geometry/beziercurves/ComplexBezierCurve";
import { Point } from "toolhelpers/geometry/Point";

import BezierComplexSketch from "./BezierComplexSketch";

const width = Math.min(1000, window.innerWidth - 10);
const height = Math.min(600, window.innerHeight - 350);

const fontFamily = '"Source Code Pro", monospace';

const Bezier = () => {
    const [curve, setCurve] = useState<ComplexBezierCurve>(
        new ComplexBezierCurve(
            new Point(50, height - 50), // bottom left
            new Point(50, 50), // top left
            new Point(width - 50, 50), // top right
            new Point(width - 50, height - 50), // bottom right
        ),
    );

    const [t, setT] = useState<number>(0.5);
    const [approximationSegments, setApproximationSegments] =
        useState<number>(50);
    const [offset, setOffset] = useState<number>(0);

    const [shouldShowProgress, setShouldShowProgress] = useState<boolean>(true);

    const handleTChange = (_: Event, newValue: number | number[]) => {
        setT(newValue as number);
    };

    const handleApproximationSegmentsChange = (
        _: Event,
        newValue: number | number[],
    ) => {
        setApproximationSegments(newValue as number);
    };

    const handleOffsetChange = (_: Event, newValue: number | number[]) => {
        setOffset(newValue as number);
    };

    const handleShouldShowProgressChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setShouldShowProgress(event.target.checked);
    };

    const handleAddPoint = () => {
        const currentPoints = curve.points;
        const newPoint =
            currentPoints.length < 2
                ? new Point(width / 2, height / 2)
                : new Point(
                      ((currentPoints.at(-1) as Point).x +
                          (currentPoints.at(-2) as Point).x) /
                          2,

                      ((currentPoints.at(-1) as Point).y +
                          (currentPoints.at(-2) as Point).y) /
                          2,
                  );
        currentPoints.splice(-1, 0, newPoint);
        setCurve(new ComplexBezierCurve(...currentPoints));
    };

    const handleRemovePoint = () => {
        const currentPoints = curve.points;
        if (currentPoints.length > 2) {
            currentPoints.splice(-2, 1);
            setCurve(new ComplexBezierCurve(...currentPoints));
        }
    };

    return (
        <>
            <BezierComplexSketch
                width={width}
                height={height}
                curve={curve}
                t={t}
                offset={offset}
                shouldShowProgress={shouldShowProgress}
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
                    id="approximation-segments-typography"
                    fontFamily='"Source Code Pro", monospace'
                >
                    # segments: {approximationSegments}
                </Typography>
                <Slider
                    value={approximationSegments}
                    onChange={handleApproximationSegmentsChange}
                    min={1}
                    max={120}
                    step={1}
                    valueLabelDisplay="auto"
                    aria-labelledby="approximation-segments-typography"
                />
                <Typography
                    id="offset-typography"
                    fontFamily='"Source Code Pro", monospace'
                >
                    offset: {offset}
                </Typography>
                <Slider
                    value={offset}
                    onChange={handleOffsetChange}
                    min={-50}
                    max={50}
                    step={1}
                    valueLabelDisplay="auto"
                    aria-labelledby="offset-typography"
                />
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-evenly",
                        width: 1,
                    }}
                >
                    <FormControlLabel
                        control={
                            <Switch
                                checked={shouldShowProgress}
                                onChange={handleShouldShowProgressChange}
                            />
                        }
                        label="show curve progress"
                        componentsProps={{
                            typography: {
                                sx: {
                                    fontFamily: fontFamily,
                                },
                            },
                        }}
                    />
                    <Button
                        variant="outlined"
                        onClick={handleRemovePoint}
                        sx={{
                            fontFamily: fontFamily,
                        }}
                    >
                        remove point
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleAddPoint}
                        sx={{
                            fontFamily: fontFamily,
                        }}
                    >
                        add point
                    </Button>
                </Box>
            </Box>
        </>
    );
};

export default Bezier;
