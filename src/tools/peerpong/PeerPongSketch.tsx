import p5Types from "p5";
import Sketch from "react-p5";

import { ConnectionInfo } from "components/PeerJSWrapper/types";
import { clamp } from "utils";

type Point = {
    x: number;
    y: number;
};

type Vector = Point;

type Ball = {
    radius: number;
    position: Point;
    velocity: Vector;
};

type HostState = {
    ball: Ball;
    points: { host: number; peer: number };
    hostPaddle: Point;
};

type PeerState = {
    peerPaddle: Point;
};

type State = HostState | PeerState;

const fontString = '"Source Code Pro", monospace';

const width = Math.min(window.innerWidth, 500);
const height = 500;

const paddleSize = [20, 150];
const tolerance = 10;
const maxPaddleRotationAngle = 80;
const magnitudeMultiplierOnHit = 1.1;

let hostState: HostState = {
    ball: {
        radius: 10,
        position: {
            x: width / 2,
            y: height / 2,
        },
        velocity: { x: 0, y: 0 },
    },
    hostPaddle: { x: 50, y: height / 2 },
    points: { host: 0, peer: 0 },
};
let peerState: PeerState = {
    peerPaddle: {
        x: width - 50,
        y: height / 2,
    },
};

let hasGameStarted = false;

const PeerPongSketch = ({
    connectionInfo,
}: {
    connectionInfo: ConnectionInfo;
}) => {
    if (connectionInfo.role === "host") {
        connectionInfo.peers[0].on("data", (data: unknown) => {
            // console.log("updating peer location as host");
            // console.log(data);
            const newPeerState = data as PeerState;
            // console.log(peerData.location.y);
            peerState = { ...newPeerState };
            // peerPaddle.x = peerData.peerPaddle.x;
            // peerPaddle.y = peerData.peerPaddle.y;
        });
    } else {
        connectionInfo.host?.on("data", (data: unknown) => {
            // console.log("updating host location as peer");
            // console.log(data);
            const newHostState = data as HostState;
            // console.log(hostData.location.y);
            hostState = { ...newHostState };
            // paddle1Position.x = hostData.location.x;
            // paddle1Position.y = hostData.location.y;
            // ball = hostData.ball;
        });
    }

    const sendData = (data: State) => {
        if (connectionInfo.role === "host") {
            connectionInfo.peers[0].send(data);
        } else {
            connectionInfo.host?.send(data);
        }
    };

    const tryReflectBall = (p5: p5Types) => {
        const { ball, hostPaddle } = hostState;
        const { peerPaddle } = peerState;

        p5.push();
        p5.angleMode(p5.DEGREES);

        // vertical
        if (ball.position.y - ball.radius < 0) {
            ball.position.y = ball.radius;
            ball.velocity.y *= -1;
        } else if (ball.position.y + ball.radius > height) {
            ball.position.y = height - ball.radius;
            ball.velocity.y *= -1;
        }

        // paddles
        if (
            ball.position.x - ball.radius < hostPaddle.x + paddleSize[0] / 2 &&
            ball.position.x - ball.radius >
                hostPaddle.x + paddleSize[0] / 2 - tolerance &&
            Math.abs(ball.position.y - hostPaddle.y) <
                paddleSize[1] / 2 + ball.radius
        ) {
            // we hit the host paddle
            const diff = ball.position.y - hostPaddle.y;
            const rotation = p5.map(
                diff,
                -paddleSize[1] / 2,
                paddleSize[1] / 2,
                -maxPaddleRotationAngle,
                maxPaddleRotationAngle,
            );
            const vector = p5.createVector(ball.velocity.x, ball.velocity.y);
            const magnitude = vector.mag();
            vector.set(magnitude * magnitudeMultiplierOnHit, 0);
            vector.rotate(rotation);
            hostState.ball.velocity.x = vector.x;
            hostState.ball.velocity.y = vector.y;

            // const diff = ball.position.y - hostPaddle.y;
            // const currentMagnitude = p5
            //     .createVector(ball.velocity.x, ball.velocity.y)
            //     .mag();
            // // velocityVector
            // const newVelocityVector = p5.createVector(
            //     diff * paddleInfluenceScalar,
            //     ball.velocity.x * -1,
            // );
            // newVelocityVector.setMag(currentMagnitude);
            // hostState.ball.velocity.y = newVelocityVector.x;
            // hostState.ball.velocity.x = newVelocityVector.y;
        } else if (
            ball.position.x + ball.radius > peerPaddle.x - paddleSize[0] / 2 &&
            ball.position.x + ball.radius <
                peerPaddle.x - paddleSize[0] / 2 + tolerance &&
            Math.abs(ball.position.y - peerPaddle.y) <
                paddleSize[1] / 2 + ball.radius
        ) {
            // we hit the peer paddle
            const diff = ball.position.y - peerPaddle.y;
            const rotation = p5.map(
                diff,
                -paddleSize[1] / 2,
                paddleSize[1] / 2,
                maxPaddleRotationAngle,
                -maxPaddleRotationAngle,
            );
            const vector = p5.createVector(ball.velocity.x, ball.velocity.y);
            const magnitude = vector.mag();
            vector.set(-magnitude * magnitudeMultiplierOnHit, 0);
            vector.rotate(rotation);
            hostState.ball.velocity.x = vector.x;
            hostState.ball.velocity.y = vector.y;
        }

        p5.pop();
    };

    const checkLoseCondition = () => {
        const { ball } = hostState;
        if (ball.position.x < 0) {
            // peer gets a point
            hostState.points.peer++;
            ball.position = { x: width / 2, y: height / 2 };
            ball.velocity = { x: 0, y: 0 };
            hasGameStarted = false;
        } else if (ball.position.x > width) {
            // host gets a point
            hostState.points.host++;
            ball.position = { x: width / 2, y: height / 2 };
            ball.velocity = { x: 0, y: 0 };
            hasGameStarted = false;
        }
    };

    const mousePressed = () => {
        if (!hasGameStarted) {
            hasGameStarted = true;
            hostState.ball.velocity = {
                x: 2,
                y: 0,
            };
        }
    };

    const setup = (p5: p5Types, canvasParentRef: Element) => {
        p5.createCanvas(width, height).parent(canvasParentRef);
        canvasParentRef.setAttribute("style", "touch-action: none");
    };

    const draw = (p5: p5Types) => {
        // update positions
        if (connectionInfo.role === "host") {
            // paddle
            hostState.hostPaddle.y = clamp(
                p5.mouseY,
                paddleSize[1] / 2,
                height - paddleSize[1] / 2,
            );

            // ball position
            hostState.ball.position.x += hostState.ball.velocity.x;
            hostState.ball.position.y += hostState.ball.velocity.y;
            tryReflectBall(p5);
            checkLoseCondition();
        } else {
            // just the paddle if we are a peer
            peerState.peerPaddle.y = clamp(
                p5.mouseY,
                paddleSize[1] / 2,
                height - paddleSize[1] / 2,
            );
        }

        // communicate data
        if (connectionInfo.role === "host") {
            // console.log(paddle2Position);
            sendData({
                ...hostState,
            });
        } else {
            // send updated position
            sendData({
                ...peerState,
            });
        }

        // draw the background
        p5.background(p5.color("#222"));

        // draw the paddles
        p5.push();
        p5.rectMode(p5.CENTER);
        p5.rect(
            hostState.hostPaddle.x,
            hostState.hostPaddle.y,
            paddleSize[0],
            paddleSize[1],
        );
        p5.rect(
            peerState.peerPaddle.x,
            peerState.peerPaddle.y,
            paddleSize[0],
            paddleSize[1],
        );
        p5.pop();

        // draw the ball
        p5.push();
        p5.stroke(p5.color("#FFF"));
        p5.fill(p5.color("#FFF"));
        p5.circle(
            hostState.ball.position.x,
            hostState.ball.position.y,
            hostState.ball.radius * 2,
        );
        p5.pop();

        // draw points
        p5.push();
        p5.fill(p5.color("#FFF"));
        p5.textSize(25);
        p5.textFont(fontString);
        p5.textAlign(p5.LEFT, p5.TOP);
        p5.text(hostState.points.host, 10, 10);
        p5.textAlign(p5.RIGHT, p5.TOP);
        p5.text(hostState.points.peer, width - 10, 10);
        p5.pop();
    };

    return <Sketch setup={setup} draw={draw} mousePressed={mousePressed} />;
};

export default PeerPongSketch;
