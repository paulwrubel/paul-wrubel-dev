import { useEffect, useState } from "react";

import { Container, Link as MuiLink, Paper, Typography } from "@mui/material";

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
                <MuiLink href="/tools">./do-more</MuiLink>
            </span>
        ),
        i: 1000,
    },
];

const Home = () => {
    const [enterPressed, setEnterPressed] = useState(false);

    const [commandIndex, setCommandIndex] = useState(0);
    const [commandString, setCommandString] = useState<string>("> ");

    const [outputIndex, setOutputIndex] = useState(0);
    const [outputNodes, setOutputNodes] = useState<React.ReactNode[]>([]);

    const [showCaret, setShowCaret] = useState(true);
    const [animFinished, setAnimFinished] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (animFinished && e.key === "Enter") {
                setEnterPressed(true);
            }
            document.removeEventListener("keydown", handleKeyDown);
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    });

    useEffect(() => {
        setTimeout(
            () => {
                setAnimFinished(true);
            },
            commandSteps.reduce((acc, cur) => {
                return acc + cur.i;
            }, 100),
        );
    }, []);

    useEffect(() => {
        setTimeout(() => {
            setShowCaret(!showCaret);
        }, 500);
    }, [showCaret]);

    useEffect(() => {
        if (commandIndex < commandSteps.length) {
            const nextStep = commandSteps[commandIndex];
            setTimeout(() => {
                setCommandString(commandString + nextStep.s);
            }, nextStep.i);
            setCommandIndex(commandIndex + 1);
        }
    }, [commandString]);

    useEffect(() => {
        if (enterPressed && outputIndex < outputSteps.length) {
            const nextStep = outputSteps[outputIndex];
            setTimeout(() => {
                setOutputNodes([...outputNodes, nextStep.n]);
            }, nextStep.i);
            setOutputIndex(outputIndex + 1);
        }
    }, [outputNodes, enterPressed]);

    return (
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
                    {commandString + (showCaret && !enterPressed ? "_" : "")}
                </Typography>
            </Paper>
            {enterPressed && (
                <Paper variant="outlined" elevation={0} sx={{ p: 2, m: 2 }}>
                    <Typography
                        component="div"
                        fontSize="3rem"
                        fontFamily='"Source Code Pro", monospace'
                        whiteSpace="pre-wrap"
                    >
                        {outputNodes}
                        {outputIndex < 6 && showCaret ? "_" : " "}
                    </Typography>
                </Paper>
            )}
        </Container>
    );
};

export default Home;
