import { Point } from "toolhelpers/geometry/Point";
import { Vector } from "toolhelpers/geometry/Vector";

class Arm {
    length: number;
    mass: number;
    // angle: number;

    position: Point;
    velocity: Vector;

    previousPositionFrame: Point;
    previousPositionStep: Point;

    constructor(
        length: number,
        mass: number,
        initialArmOrigin: Point,
        initialAngle: number,
        basisVector: Vector,
    ) {
        this.length = length;
        this.mass = mass;
        // this.angle=initialAngle

        const point = initialArmOrigin.add(
            basisVector.withMagnitude(length).rotatedByDegrees(initialAngle),
        );

        this.position = point.copy();
        this.velocity = Vector.Zero;

        this.previousPositionFrame = point.copy();
        this.previousPositionStep = point.copy();
    }

    applyConstraintsAgainst(target: Point | Arm) {
        const targetPoint = target instanceof Point ? target : target.position;
        const requiredLength = this.length;
        const currentLength = targetPoint.to(this.position).magnitude;
        const lengthScalar = currentLength - requiredLength;

        const unitToTarget = this.position.to(targetPoint).unit();

        const inverseMass = 1 / this.mass;
        const inverseMassTarget = target instanceof Point ? 0 : 1 / target.mass;

        if (target instanceof Arm) {
            const massScalarTarget =
                inverseMassTarget / (inverseMass + inverseMassTarget);
            const previousDelta = unitToTarget.multipliedBy(
                -1 * lengthScalar * massScalarTarget,
            );
            target.position = target.position.add(previousDelta);
        }

        const massScalar = inverseMass / (inverseMass + inverseMassTarget);
        const currentDelta = unitToTarget.multipliedBy(
            lengthScalar * massScalar,
        );
        this.position = this.position.add(currentDelta);
    }

    savePreviousPositionFrame() {
        this.previousPositionFrame = this.position;
    }

    savePreviousPositionStep() {
        this.previousPositionStep = this.position;
    }

    copy(): Arm {
        const newArm = new Arm(0, 0, new Point(0, 0), 0, Vector.Zero);

        newArm.length = this.length;
        newArm.mass = this.mass;

        newArm.position = this.position;
        newArm.velocity = this.velocity;

        newArm.previousPositionFrame = this.previousPositionFrame;
        newArm.previousPositionStep = this.previousPositionStep;

        return newArm;
    }

    toString(): string {
        return `{l:${this.length},m:${this.mass}}`;
    }
}

export { Arm };
