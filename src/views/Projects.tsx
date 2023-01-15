/* eslint-disable sonarjs/no-duplicate-string */
import { useEffect, useState } from "react";

import Search from "@mui/icons-material/Search";
import {
    Box,
    Container,
    InputAdornment,
    Link as MuiLink,
    Paper,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";

import { Helmet } from "react-helmet-async";

import projectData, { Project as ProjectDataType } from "data/projects";

const commandSteps: { s: string; i: number }[] = [
    {
        s: " |",
        i: 1000,
    },
    {
        s: " g",
        i: 200,
    },
    {
        s: "r",
        i: 50,
    },
    {
        s: "e",
        i: 50,
    },
    {
        s: "p",
        i: 50,
    },
];

const Projects = ({
    finishedAnim,
    setFinishedAnim,
}: {
    finishedAnim: boolean;
    setFinishedAnim: (arg1: boolean) => void;
}) => {
    const theme = useTheme();
    const isBelowMediumBreakpoint = useMediaQuery(theme.breakpoints.down("md"));

    const fontSizePrimary = isBelowMediumBreakpoint ? "1.6rem" : "2rem";
    const fontSizeSecondary = isBelowMediumBreakpoint ? "1rem" : "1.8rem";
    const fontSizeTertiary = isBelowMediumBreakpoint ? "1rem" : "1.5rem";
    const fontSizeBody = isBelowMediumBreakpoint ? "1rem" : "1.3rem";

    const [commandAdditionalText, setCommandAdditionalText] = useState<string>(
        finishedAnim ? commandSteps.map((s) => s.s).join("") : "",
    );
    const [commandIndex, setCommandIndex] = useState(0);

    useEffect(() => {
        if (!finishedAnim && commandIndex < commandSteps.length) {
            const nextStep = commandSteps[commandIndex];
            setTimeout(() => {
                setCommandAdditionalText(commandAdditionalText + nextStep.s);
            }, nextStep.i);
            setCommandIndex(commandIndex + 1);
        }
    }, [commandAdditionalText]);

    const [showSearchField, setShowSearchField] = useState(finishedAnim);

    useEffect(() => {
        if (!finishedAnim) {
            setTimeout(
                () => {
                    setShowSearchField(true);
                    setFinishedAnim(true);
                },
                commandSteps.reduce((acc, step) => acc + step.i, 400),
            );
        }
    });

    const [searchString, setSearchString] = useState("");
    const [projectsList, setProjectsList] = useState<ProjectDataType[]>(
        projectData.slice().sort((a, b) => b.date.diff(a.date, "day")),
    );

    useEffect(() => {
        setProjectsList(
            projectData
                .slice()
                .filter(
                    (p) =>
                        p.name.includes(searchString) ||
                        p.description.includes(searchString) ||
                        p.languages.some((l) => l.includes(searchString)) ||
                        p.technologies.some((t) => t.includes(searchString)),
                ),
        );
    }, [searchString]);

    return (
        <>
            <Helmet>
                <title>{"> projects | paul wrubel"}</title>
            </Helmet>
            <Container sx={{ my: 10 }}>
                <Paper
                    variant="outlined"
                    elevation={0}
                    sx={{
                        p: 2,
                        mx: 2,
                        my: 4,
                    }}
                >
                    <Box
                        sx={{
                            width: 1,
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "center",
                            rowGap: 1,
                        }}
                    >
                        <Typography
                            // flexGrow={1}
                            // flexShrink={0}
                            // noWrap
                            variant="h1"
                            fontSize={fontSizePrimary}
                            fontFamily='"Source Code Pro", monospace'
                            sx={{ overflowWrap: "normal" }}
                        >
                            {"> cat projects" + commandAdditionalText}
                        </Typography>
                        {showSearchField && (
                            <TextField
                                size="small"
                                // fullWidth
                                variant="outlined"
                                value={searchString}
                                onChange={(e) =>
                                    setSearchString(e.target.value)
                                }
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    // width: "auto",
                                    minWidth: 50,
                                    flexGrow: 1,
                                    // flexShrink: 1,
                                    ml: 2,
                                    "& .MuiInputBase-input": {
                                        fontSize: { fontSizePrimary },
                                        fontFamily:
                                            '"Source Code Pro", monospace',
                                    },
                                }}
                            />
                        )}
                    </Box>
                </Paper>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {projectsList.map(
                        ({
                            name,
                            description,
                            date,
                            technologies,
                            languages,
                            link,
                            codeLink,
                        }) => (
                            <Paper
                                key={name}
                                variant="outlined"
                                elevation={0}
                                sx={{ p: 2, mx: 2, my: 1 }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        py: 1,
                                        gap: 1,
                                        borderBottom: "1px solid #333",
                                    }}
                                >
                                    <Typography
                                        fontSize={fontSizeSecondary}
                                        fontWeight="bold"
                                        fontFamily='"Source Code Pro", monospace'
                                        sx={{ flexGrow: 1 }}
                                    >
                                        {link ? (
                                            <MuiLink href={link}>
                                                {name}
                                            </MuiLink>
                                        ) : (
                                            name
                                        )}{" "}
                                        |{" "}
                                        <MuiLink href={codeLink}>
                                            source
                                        </MuiLink>
                                    </Typography>
                                    <Typography
                                        fontSize={fontSizeSecondary}
                                        align="right"
                                        fontWeight="bold"
                                        fontFamily='"Source Code Pro", monospace'
                                        sx={{ flexGrow: 0 }}
                                    >
                                        {date.format("MMM, YYYY")}
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        py: 1,
                                        gap: 1,
                                        borderBottom: "1px solid #333",
                                    }}
                                >
                                    <Typography
                                        fontSize={fontSizeTertiary}
                                        fontFamily='"Source Code Pro", monospace'
                                    >
                                        {languages.join(", ")}
                                    </Typography>
                                    <Typography
                                        fontSize={fontSizeTertiary}
                                        fontFamily='"Source Code Pro", monospace'
                                    >
                                        {technologies.join(", ")}
                                    </Typography>
                                </Box>
                                <Typography
                                    fontSize={fontSizeBody}
                                    fontFamily='"Source Code Pro", monospace'
                                    sx={{ py: 1, pl: "10%" }}
                                >
                                    {description}
                                </Typography>
                            </Paper>
                        ),
                    )}
                </Box>
            </Container>
        </>
    );
};

export default Projects;
