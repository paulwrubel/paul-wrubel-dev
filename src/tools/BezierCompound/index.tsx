import { useState } from "react";

import { OfflineShareTwoTone } from "@mui/icons-material";
import {
    Box,
    Button,
    FormControlLabel,
    Slider,
    Switch,
    Typography,
} from "@mui/material";

import { CompoundCubicBezierCurve } from "toolhelpers/geometry/beziercurves/CompoundCubicBezierCurve";
import { Point } from "toolhelpers/geometry/Point";

import BezierCompoundSketch from "./BezierCompoundSketch";

const width = Math.min(1000, window.innerWidth - 10);
const height = Math.min(600, window.innerHeight - 350);

const pointSpacing = 100;

const fontFamily = '"Source Code Pro", monospace';

const Bezier = () => {
    const [curve, setCurve] = useState<CompoundCubicBezierCurve>(
        new CompoundCubicBezierCurve(
            new Point(pointSpacing / 2, height / 2), // far left bottom
            new Point(pointSpacing / 2, height / 2 - pointSpacing), // far left top
            new Point(pointSpacing * 1.5, height / 2 - pointSpacing), // near left top
            new Point(pointSpacing * 1.5, height / 2), // near left bottom
        ),
    );

    const [t, setT] = useState<number>(0.5);
    const [approximationSegments, setApproximationSegments] =
        useState<number>(50);
    const [offset, setOffset] = useState<number>(0);

    const [shouldShowProgress, setShouldShowProgress] = useState<boolean>(true);
    const [shouldForceCurveSmoothness, setShouldForceCurveSmoothness] =
        useState<boolean>(false);

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

    const handleShouldForceCurveSmoothnessChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setShouldForceCurveSmoothness(event.target.checked);
    };

    const handleAddPoint = () => {
        const currentPoints = curve.points;
        let finalPoint = currentPoints.at(-1) as Point;
        const penultimatePoint = currentPoints.at(-2) as Point;
        let directionVector = penultimatePoint
            .to(finalPoint)
            .withMagnitude(pointSpacing);

        const rotationDegrees = curve.curveCount % 2 === 0 ? 90 : -90;
        const newPoints: Point[] = [];
        for (let i = 0; i < 3; i++) {
            const newPoint = finalPoint.add(directionVector);
            newPoints.push(newPoint);
            finalPoint = newPoint;
            directionVector = directionVector.rotateDegrees(rotationDegrees);
        }
        currentPoints.push(...newPoints);
        setCurve(new CompoundCubicBezierCurve(...currentPoints));
    };

    const handleRemovePoint = () => {
        const currentPoints = curve.points;
        if (currentPoints.length > 2) {
            currentPoints.splice(-2, 1);
            setCurve(new CompoundCubicBezierCurve(...currentPoints));
        }
    };

    return (
        <>
            <BezierCompoundSketch
                width={width}
                height={height}
                curve={curve}
                t={t}
                offset={offset}
                shouldShowProgress={shouldShowProgress}
                shouldEnforceSmoothness={shouldForceCurveSmoothness}
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
                    <FormControlLabel
                        control={
                            <Switch
                                checked={shouldForceCurveSmoothness}
                                onChange={
                                    handleShouldForceCurveSmoothnessChange
                                }
                            />
                        }
                        label="force curve smoothness"
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
                        remove curve
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleAddPoint}
                        sx={{
                            fontFamily: fontFamily,
                        }}
                    >
                        add curve
                    </Button>
                </Box>
            </Box>
        </>
    );
};

export default Bezier;
