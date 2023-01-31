import p5Types from "p5";

import { Line } from "toolhelpers/geometry/Line";
import { Point } from "toolhelpers/geometry/Point";
import { Vector } from "toolhelpers/geometry/Vector";

import { Arm } from "./Arm";
import { ArmData } from "./types";

const isArmArray = (
    armsOrArmData: (Arm | ArmData)[],
): armsOrArmData is Arm[] => {
    return armsOrArmData.every((armOrArmData) => armOrArmData instanceof Arm);
};

const isArmDataArray = (
    armsOrArmData: (Arm | ArmData)[],
): armsOrArmData is ArmData[] => {
    return armsOrArmData.every(
        (armOrArmData) =>
            (armOrArmData as ArmData).length !== undefined &&
            (armOrArmData as ArmData).mass !== undefined &&
            (armOrArmData as ArmData).initialAngle !== undefined,
    );
};

class Pendulum {
    origin: Point;
    gravity: Vector;
    basisVector: Vector;
    substeps: number;

    #arms: Arm[];

    constructor(
        origin: Point,
        gravity: Vector,
        basisVector: Vector,
        renderSubsteps: number,
        ...armsOrArmData: (Arm | ArmData)[]
    ) {
        this.origin = origin;
        this.gravity = gravity;
        this.basisVector = basisVector;
        this.substeps = renderSubsteps;

        this.#arms = [];
        if (isArmArray(armsOrArmData)) {
            this.#arms = armsOrArmData;
        } else if (isArmDataArray(armsOrArmData)) {
            for (let i = 0; i < armsOrArmData.length; i++) {
                const { length, mass, initialAngle } = armsOrArmData[i];

                const startingPoint =
                    i === 0 ? origin : (this.#arms.at(-1) as Arm).position;

                this.#arms.push(
                    new Arm(
                        length,
                        mass,
                        startingPoint,
                        initialAngle,
                        basisVector,
                    ),
                );
            }
        } else {
            throw new Error("invalid arm info passed to Pendulum");
        }
    }

    get arms() {
        return this.#arms;
    }

    // set arms(newArms: Arm[]) {
    //     this.#arms = newArms;
    // }

    drawArms(p5: p5Types) {
        for (let i = 0; i < this.#arms.length; i++) {
            const start = i === 0 ? this.origin : this.#arms[i - 1].position;
            start.lineTo(this.#arms[i].position).draw(p5);
        }
    }

    drawPoints(p5: p5Types) {
        for (let i = 0; i < this.#arms.length; i++) {
            const arm = this.#arms[i];
            arm.position.drawAsCircle(p5, Math.sqrt((arm.mass * 20) / Math.PI));
        }
    }

    update(deltaTime: number) {
        this.#arms.forEach((arm) => arm.savePreviousPositionFrame());
        for (let i = 0; i < this.substeps; i++) {
            this.#updateStep(deltaTime);
        }
    }

    traceLine(): Line {
        const finalArm = this.#arms[this.#arms.length - 1];
        return finalArm.previousPositionFrame.lineTo(finalArm.position);
    }

    #updateStep(deltaTime: number) {
        const stepDeltaTime = deltaTime / this.substeps;
        this.#updateForcesAndPositions(stepDeltaTime);
        this.#applyConstraints();
        this.#updateVelocities(stepDeltaTime);
    }

    #updateForcesAndPositions(deltaTime: number) {
        this.#arms.forEach((arm) => {
            const velocity = arm.velocity.addedTo(
                this.gravity.multipliedBy(deltaTime),
            );
            arm.savePreviousPositionStep();
            arm.position = arm.position.add(velocity.multipliedBy(deltaTime));
        });
    }

    #applyConstraints() {
        for (let i = 0; i < this.#arms.length; i++) {
            const constraintTarget = i === 0 ? this.origin : this.#arms[i - 1];

            this.#arms[i].applyConstraintsAgainst(constraintTarget);
        }
    }

    #updateVelocities(deltaTime: number) {
        this.#arms.forEach((arm) => {
            arm.velocity = arm.previousPositionStep
                .to(arm.position)
                .dividedBy(deltaTime);
        });
    }

    copy(): Pendulum {
        return new Pendulum(
            this.origin,
            this.gravity,
            this.basisVector,
            this.substeps,
            ...this.#arms.map((arm) => arm.copy()),
        );
    }
}

export { Pendulum };
