import p5Types from "p5";
import Sketch from "react-p5";

import { BezierCurve, Point } from "./BezierCurve";

const pointDragRadius = 30;

const startColor = "#191";
const anchorColor = "#333";
const endColor = "#933";

const colorsByOrder = ["#999", "#9D9", "#99D", "#D99", "#DD9", "#D9D", "#9DD"];

let indexBeingDragged = -1;
const pointOffset: Point = { x: 0, y: 0 };

const BezierSketch = ({
    width,
    height,
    curve,
    t,
    shouldShowProgress,
    approximationSegments,
}: {
    width: number;
    height: number;
    curve: BezierCurve;
    t: number;
    shouldShowProgress: boolean;
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
        if (curve.order > 1) {
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
        curve.draw(p5, shouldShowProgress ? t : 1, approximationSegments);
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
            touchStarted={mousePressed}
            touchEnded={mouseReleased}
        />
    );
};

export default BezierSketch;
