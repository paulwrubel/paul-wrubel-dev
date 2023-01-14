import { useEffect, useState } from "react";

import { Container, Link as MuiLink, Paper, Typography } from "@mui/material";

import { Helmet } from "react-helmet-async";

const commandSteps: { s: string; i: number }[] = [
    { s: ".", i: 500 },
    { s: "/", i: 200 },
    { s: "p", i: 200 },
    { s: "a", i: 50 },
    { s: "u", i: 50 },
    { s: "l", i: 50 },
    { s: "w", i: 270 },
    { s: "r", i: 70 },
    { s: "u", i: 70 },
    { s: "b", i: 70 },
    { s: "e", i: 70 },
    { s: "l", i: 70 },
    { s: ".", i: 300 },
    { s: "d", i: 300 },
    { s: "e", i: 100 },
    { s: "v", i: 100 },
];

const outputSteps: { n: React.ReactNode; i: number }[] = [
    { n: "software engineer\n", i: 0 },
    { n: "technology enthusiast\n", i: 1000 },
    { n: "video gamer\n", i: 1000 },
    { n: "cat appreciator\n", i: 1000 },
    {
        n: (
            <span key="about-link">
                {"> "}
                <MuiLink href="/about">./learn-more</MuiLink>
            </span>
        ),
        i: 1000,
    },
    {
        n: (
            <span key="projects-link">
                <br />
                {"> "}
                <MuiLink href="/projects">./see-more</MuiLink>
            </span>
        ),
        i: 1000,
    },
    {
        n: (
            <span key="tools-link">
                <br />
                {"> "}
                <MuiLink href="/tools">./experience-more</MuiLink>
            </span>
        ),
        i: 1000,
    },
];

const autoInteractDelay = 5000;

const Home = ({
    finishedAnim,
    setFinishedAnim,
}: {
    finishedAnim: boolean;
    setFinishedAnim: (arg1: boolean) => void;
}) => {
    const [interactionCompleted, setInteractionCompleted] =
        useState(finishedAnim);

    const [commandIndex, setCommandIndex] = useState(0);
    const [commandString, setCommandString] = useState<string>(
        finishedAnim ? "> " + commandSteps.map((s) => s.s).join("") : "> ",
    );

    const [outputIndex, setOutputIndex] = useState(0);
    const [outputNodes, setOutputNodes] = useState<React.ReactNode[]>(
        finishedAnim ? outputSteps.map((s) => s.n) : [],
    );

    const [showCaret, setShowCaret] = useState(true);
    const [commandAnimationFinished, setCommandAnimationFinished] =
        useState(finishedAnim);

    useEffect(() => {
        if (!finishedAnim) {
            const handleKeyDown = (e: KeyboardEvent) => {
                if (commandAnimationFinished && e.key === "Enter") {
                    setInteractionCompleted(true);
                }
                document.removeEventListener("keydown", handleKeyDown);
            };
            const handleTouchEnd = () => {
                if (commandAnimationFinished) {
                    setInteractionCompleted(true);
                }
                document.removeEventListener("touchend", handleTouchEnd);
            };
            document.addEventListener("keydown", handleKeyDown);
            document.addEventListener("touchend", handleTouchEnd);
            return () => {
                document.removeEventListener("keydown", handleKeyDown);
                document.removeEventListener("touchend", handleTouchEnd);
            };
        }
    });

    useEffect(() => {
        if (!finishedAnim) {
            setTimeout(
                () => {
                    setCommandAnimationFinished(true);
                    setTimeout(() => {
                        setInteractionCompleted(true);
                    }, autoInteractDelay);
                },
                commandSteps.reduce((acc, cur) => {
                    return acc + cur.i;
                }, 100),
            );
        }
    }, []);

    useEffect(() => {
        setTimeout(() => {
            setShowCaret(!showCaret);
        }, 500);
    }, [showCaret]);

    useEffect(() => {
        if (!finishedAnim && commandIndex < commandSteps.length) {
            const nextStep = commandSteps[commandIndex];
            setTimeout(() => {
                setCommandString(commandString + nextStep.s);
            }, nextStep.i);
            setCommandIndex(commandIndex + 1);
        }
    }, [commandString]);

    useEffect(() => {
        if (
            !finishedAnim &&
            interactionCompleted &&
            outputIndex < outputSteps.length
        ) {
            const nextStep = outputSteps[outputIndex];
            setTimeout(() => {
                setOutputNodes([...outputNodes, nextStep.n]);
            }, nextStep.i);
            setOutputIndex(outputIndex + 1);
        }
    }, [outputNodes, interactionCompleted]);

    useEffect(() => {
        if (!finishedAnim && interactionCompleted) {
            const timeoutID = setTimeout(
                () => {
                    setFinishedAnim(true);
                },
                outputSteps.reduce((acc, cur) => {
                    return acc + cur.i;
                }, 100),
            );
            return () => {
                clearTimeout(timeoutID);
            };
        }
    }, [interactionCompleted]);

    return (
        <>
            <Helmet>
                <title>{"> paul wrubel"}</title>
            </Helmet>
            <Container sx={{ my: 10 }}>
                <Paper
                    variant="outlined"
                    elevation={0}
                    sx={{
                        p: 2,
                        m: 2,
                    }}
                >
                    <Typography
                        // align="left"
                        fontSize="4rem"
                        fontFamily='"Source Code Pro", monospace'
                    >
                        {commandString +
                            (showCaret && !interactionCompleted ? "_" : "")}
                    </Typography>
                </Paper>
                {interactionCompleted && (
                    <Paper variant="outlined" elevation={0} sx={{ p: 2, m: 2 }}>
                        <Typography
                            component="div"
                            fontSize="3rem"
                            fontFamily='"Source Code Pro", monospace'
                            whiteSpace="pre-wrap"
                        >
                            {outputNodes}
                            {!finishedAnim && outputIndex < 6 && showCaret
                                ? "_"
                                : " "}
                        </Typography>
                    </Paper>
                )}
            </Container>
        </>
    );
};

export default Home;
