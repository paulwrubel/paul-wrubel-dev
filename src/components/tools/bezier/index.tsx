import { useState } from "react";

import { Box, Button, Slider, Typography } from "@mui/material";

import p5Types from "p5";
import Sketch from "react-p5";

import { BezierCurve, Point } from "./bezier";

const width = Math.min(1000, window.innerWidth - 10);
const height = 600;

const pointDragRadius = 30;

const startColor = "#191";
const anchorColor = "#333";
const endColor = "#933";

const colorsByOrder = ["#999", "#9D9", "#99D", "#D99", "#DD9", "#D9D", "#9DD"];

let indexBeingDragged = -1;
const pointOffset: Point = { x: 0, y: 0 };

const BezierSketch = ({
    curve,
    t,
    approximationSegments,
}: {
    curve: BezierCurve;
    t: number;
    approximationSegments: number;
}) => {
    const isPointInCircle = (
        point: Point,
        center: Point,
        radius: number,
    ): boolean => {
        const dx = center.x - point.x;
        const dy = center.y - point.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < radius;
    };

    const keepPointsInBounds = (p5: p5Types, radius = 0) => {
        curve.points.forEach((point) => {
            if (point.x > p5.width - radius) {
                point.x = p5.width - radius;
            } else if (point.x < radius) {
                point.x = radius;
            }
            if (point.y > p5.height - radius) {
                point.y = p5.height - radius;
            } else if (point.y < radius) {
                point.y = radius;
            }
        });
    };

    const mousePressed = (p5: p5Types) => {
        for (let i = 0; i < curve.points.length; i++) {
            const point = curve.points[i];
            if (
                isPointInCircle(
                    { x: p5.pmouseX, y: p5.pmouseY },
                    { x: point.x, y: point.y },
                    pointDragRadius,
                )
            ) {
                indexBeingDragged = i;
                pointOffset.x = point.x - p5.mouseX;
                pointOffset.y = point.y - p5.mouseY;
                break;
            }
        }
    };

    const mouseReleased = () => {
        indexBeingDragged = -1;
    };

    const setup = (p5: p5Types, canvasParentRef: Element) => {
        p5.createCanvas(width, height).parent(canvasParentRef);
        canvasParentRef.setAttribute("style", "touch-action: none");
    };

    const draw = (p5: p5Types) => {
        // perform pre-calculations
        const points = curve.points;
        points.forEach((p, i) => {
            if (indexBeingDragged === i) {
                p.x = p5.mouseX + pointOffset.x;
                p.y = p5.mouseY + pointOffset.y;
            }
        });

        keepPointsInBounds(p5);

        // draw background
        p5.background(p5.color("#EEE"));

        // draw guidelines for our order and all lower
        if (curve.order > 2) {
            let lowerOrderCurve = curve;
            let colorIndex = 0;
            do {
                // find the color for this order
                const color = p5.color(
                    colorsByOrder[colorIndex % colorsByOrder.length],
                );
                colorIndex++;

                // draw lines between the points
                lowerOrderCurve
                    .getLinesBetweenPoints()
                    .forEach(({ a: { x: x1, y: y1 }, b: { x: x2, y: y2 } }) => {
                        p5.push();
                        p5.stroke(color);
                        p5.line(x1, y1, x2, y2);
                        p5.pop();
                    });
                // draw the points
                lowerOrderCurve.points.forEach(({ x, y }) => {
                    p5.push();
                    p5.stroke(color);
                    p5.strokeWeight(3);
                    p5.noFill();
                    // p5.fill(color);
                    p5.circle(x, y, 5);
                    p5.pop();
                });
                if (lowerOrderCurve.order > 1) {
                    lowerOrderCurve = lowerOrderCurve.getReducedOrderAt(p5, t);
                } else {
                    break;
                }
            } while (lowerOrderCurve.order > 0);
        }

        // draw the curve itself
        p5.push();
        p5.noFill();
        p5.strokeWeight(2);
        curve.drawApproximation(p5, approximationSegments);
        p5.pop();

        // draw point info
        points.forEach((p, i) => {
            const color = p5.color(
                i === 0
                    ? startColor
                    : i === points.length - 1
                    ? endColor
                    : anchorColor,
            );

            // draw the actual points
            p5.push();
            p5.stroke(color);
            p5.fill(color);
            p5.circle(p.x, p.y, 10);
            p5.pop();

            // draw point drag ranges
            p5.push();
            p5.stroke(color);
            p5.noFill();
            p5.circle(p.x, p.y, pointDragRadius * 2);
            p5.pop();
        });

        // draw the point on the line at t
        const tPoint = curve.getPointAt(p5, t);
        p5.push();
        p5.stroke(p5.color("#000"));
        p5.fill(p5.color("#000"));
        p5.circle(tPoint.x, tPoint.y, 10);
        p5.pop();
    };

    return (
        <Sketch
            setup={setup}
            draw={draw}
            mousePressed={mousePressed}
            mouseReleased={mouseReleased}
        />
    );
};

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
