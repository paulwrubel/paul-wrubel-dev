import { useEffect, useState } from "react";

import { Container, Paper, Typography } from "@mui/material";

const commandSteps: { s: string; i: number; linear?: boolean }[] = [
    { s: "p", i: 50 },
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

const Home = () => {
    const [commandIndex, setCommandIndex] = useState(0);
    const [commandString, setCommandString] = useState<string>("> ");

    const [showCaret, setShowCaret] = useState(true);

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
        setTimeout(() => {
            setShowCaret(!showCaret);
        }, 500);
    }, [showCaret]);

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
                    {commandString + (showCaret ? "_" : "")}
                </Typography>
            </Paper>
            <Paper variant="outlined" elevation={0} sx={{ p: 2, m: 2 }}>
                <Typography
                    fontSize="3rem"
                    fontFamily='"Source Code Pro", monospace'
                >
                    software engineer
                    <br />
                    technology enthusiast
                </Typography>
            </Paper>
        </Container>
    );
};

export default Home;
