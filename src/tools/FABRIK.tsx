import p5Types from "p5";
import Sketch from "react-p5";

type Transform = {
    position: p5Types.Vector;
    rotation: p5Types.Vector;
};

const width = 1000;
const height = 800;

const FABRIK = () => {
    let didSetup = false;

    const initialTarget: number[] = [0, 0];
    let target: p5Types.Vector;
    const initialOrigin: number[] = [width / 2, height / 2];
    let origin: p5Types.Vector;

    const nodes = 10;
    const segmentLength = 50;
    const maxAngle = 180;
    const lengths: number[] = [...Array(nodes - 1).keys()].map(
        () => segmentLength,
    );
    const constraintAngles: number[] = [
        360,
        ...[...Array(nodes + 2).keys()].map(() => maxAngle),
    ];

    let joints: Transform[] = [];

    const isConstrained = true;
    const shouldCheckRange = true;
    const maxIterations = 50;

    // if we're this close then that's "good enough"
    const epsilon = 1.1;

    const isWithinEpsilon = () => {
        return joints[joints.length - 1].position.dist(target) < epsilon;
    };

    const isArmInRangeOfTarget = (): boolean => {
        const armLength = lengths.reduce((acc, l) => acc + l, 0);
        // console.log("arm length: ", armLength);
        const distanceToTarget = target.copy().sub(joints[0].position).mag();
        // console.log("joint 0", joints[0].position);
        // console.log("target: ", target);
        // console.log(
        //     "joint 0 to target: ",
        //     target.copy().sub(joints[0].position),
        // );
        // console.log("distance to target: ", distanceToTarget);
        // console.log("distance to target: ", distanceToTarget);
        return armLength > distanceToTarget;
    };

    const forward = (p5: p5Types) => {
        // for forwards step, we just set the initial joint to the origin to start
        joints[0].position.set(origin.copy());
        // and here we start from the second joint
        for (let i = 1; i < joints.length; i++) {
            const jointToMove: Transform = joints[i];
            const previousJoint: Transform = joints[i - 1];
            // get a vector pointing to this joint
            const unitVectorToJoint: p5Types.Vector = jointToMove.position
                .copy()
                .sub(previousJoint.position)
                .normalize();
            // move this joints to the position pointed at previously
            // multiplied by the set length of this arm segment
            jointToMove.position.set(
                previousJoint.position
                    .copy()
                    .add(unitVectorToJoint.copy().setMag(lengths[i - 1])),
            );
            // point the previous join at this joint
            previousJoint.rotation.set(
                jointToMove.position
                    .copy()
                    .sub(previousJoint.position)
                    .normalize(),
            );
            // check constraints
            if (isConstrained) {
                if (i !== 1) {
                    const twoJointsPrevious: Transform = joints[i - 2];
                    const angle = p5.degrees(
                        Math.abs(
                            twoJointsPrevious.rotation.angleBetween(
                                previousJoint.rotation,
                            ),
                        ),
                    );
                    if (angle > constraintAngles[i - 1]) {
                        previousJoint.rotation.set(
                            twoJointsPrevious.rotation
                                .copy()
                                .lerp(
                                    previousJoint.rotation,
                                    Math.min(
                                        constraintAngles[i - 1] / angle,
                                        1,
                                    ),
                                )
                                .normalize(),
                        );
                    }
                    jointToMove.position.set(
                        previousJoint.position
                            .copy()
                            .add(
                                previousJoint.rotation
                                    .normalize()
                                    .setMag(lengths[i - 1]),
                            ),
                    );
                } else {
                    const originJoint = joints[0];
                    const nextJoint = joints[1];
                    const upRotation: p5Types.Vector = p5.createVector(0, 1);
                    const angle = p5.degrees(
                        Math.abs(upRotation.angleBetween(originJoint.rotation)),
                    );
                    if (angle > constraintAngles[0]) {
                        originJoint.rotation.set(
                            originJoint.rotation
                                .copy()
                                .lerp(
                                    upRotation,
                                    Math.min(
                                        1 - constraintAngles[0] / angle,
                                        1,
                                    ),
                                )
                                .normalize(),
                        );
                    }
                    nextJoint.position.set(
                        originJoint.position
                            .copy()
                            .add(
                                originJoint.rotation
                                    .copy()
                                    .normalize()
                                    .setMag(lengths[0]),
                            ),
                    );
                }
            }
        }
    };

    const backward = (p5: p5Types) => {
        // for backwards step, we just set the final joint to the target to start
        joints[joints.length - 1].position.set(target.copy());
        // and here we start from the second-to-last joint
        for (let i = joints.length - 2; i >= 0; i--) {
            const jointToMove: Transform = joints[i];
            const previousJoint: Transform = joints[i + 1];

            // get a vector pointing to this joint
            const unitVectorToJoint: p5Types.Vector = jointToMove.position
                .copy()
                .sub(previousJoint.position)
                .normalize();
            // move this joints to the position pointed at previously
            // multiplied by the set length of this arm segment
            jointToMove.position.set(
                previousJoint.position
                    .copy()
                    .add(unitVectorToJoint.copy().setMag(lengths[i])),
            );
            // point ourselves at the previous joint
            jointToMove.rotation.set(
                previousJoint.position
                    .copy()
                    .sub(jointToMove.position)
                    .normalize(),
            );
            // check constraints
            if (isConstrained && i !== joints.length - 2) {
                const angle = p5.degrees(
                    Math.abs(
                        jointToMove.rotation.angleBetween(
                            previousJoint.rotation,
                        ),
                    ),
                );
                if (angle > constraintAngles[i + 1]) {
                    jointToMove.rotation.set(
                        jointToMove.rotation
                            .copy()
                            .lerp(
                                previousJoint.rotation,
                                Math.min(
                                    1 - constraintAngles[i + 1] / angle,
                                    1,
                                ),
                            )
                            .normalize(),
                    );
                }
                jointToMove.position.set(
                    previousJoint.position
                        .copy()
                        .sub(
                            jointToMove.rotation
                                .copy()
                                .normalize()
                                .setMag(lengths[i]),
                        ),
                );
            }
        }
    };

    const solve = (p5: p5Types) => {
        if (shouldCheckRange && !isArmInRangeOfTarget()) {
            // if we're out of range we can skip the solver
            // because we know the arm will just extend straight out towards the target
            const unitVectorToTarget = target.copy().sub(origin).normalize();
            joints[0].position.set(origin);
            for (let i = 0; i < joints.length - 1; i++) {
                joints[i + 1].position.set(
                    joints[i].position
                        .copy()
                        .add(unitVectorToTarget.copy().setMag(lengths[i])),
                );
                // console.log(`joints #${i} is now at ${}`)
            }
        } else {
            for (let i = 0; i < maxIterations; i++) {
                if (isWithinEpsilon()) {
                    break;
                }
                backward(p5);
                fixRotations();
                forward(p5);
                fixRotations();
            }
        }
        fixRotations();
    };

    const fixRotations = () => {
        for (let i = 0; i < joints.length - 1; i++) {
            const unitVectorToNextJoint = joints[i + 1].position
                .copy()
                .sub(joints[i].position)
                .normalize();
            joints[i].rotation.set(unitVectorToNextJoint);
        }
    };

    const setup = (p5: p5Types, canvasParentRef: Element) => {
        // p5.frameRate(1);

        // do some setup for the FABRIK solver
        target = p5.createVector(initialTarget[0], initialTarget[1]);
        origin = p5.createVector(initialOrigin[0], initialOrigin[1]);
        joints = [...Array(lengths.length + 1).keys()].map((i) => {
            return {
                position: i === 0 ? origin.copy() : p5.createVector(0, 0),
                rotation: p5.createVector(1, 0),
            };
        });
        // for (let i = 0; i < joints.length - 1; i++) {
        //     lengths.push(
        //         joints[i].position
        //             .copy()
        //             .sub(joints[i + 1].position)
        //             .mag(),
        //     );
        // }

        console.log("joints: ", joints);
        console.log("lengths: ", lengths);

        // do the rest of setup
        if (!didSetup) {
            p5.createCanvas(width, height).parent(canvasParentRef);
            didSetup = true;
        }
    };

    const draw = (p5: p5Types) => {
        // update target
        // console.log(p5.mouseX, p5.mouseY);
        target = p5.createVector(p5.mouseX, p5.mouseY);

        // solve fabrik
        solve(p5);

        // if (p5.frameCount % 100 === 0) {
        //     console.log(joints);
        // }

        // draw background
        p5.background(p5.color("#000"));

        // draw target
        p5.fill(p5.color("#D22"));
        p5.circle(target.x, target.y, 10);

        // draw points
        for (let i = 0; i < joints.length; i++) {
            const { x, y } = joints[i].position;
            p5.fill(p5.color("#FFF"));
            p5.circle(x, y, 10);
        }

        // draw lines
        for (let i = 0; i < joints.length - 1; i++) {
            const { x: x1, y: y1 } = joints[i].position;
            const { x: x2, y: y2 } = joints[i + 1].position;
            p5.stroke(p5.color("#FFF"));
            p5.line(x1, y1, x2, y2);
        }
    };

    return <Sketch setup={setup} draw={draw} />;
};

export default FABRIK;
