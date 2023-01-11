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
                    sx={{ p: 2, mx: 2, my: 4 }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            height: "4rem",
                        }}
                    >
                        <Typography
                            flexShrink={0}
                            noWrap
                            variant="h1"
                            fontSize="2rem"
                            fontFamily='"Source Code Pro", monospace'
                        >
                            {"> cat projects" + commandAdditionalText}
                        </Typography>
                        {showSearchField && (
                            <TextField
                                size="small"
                                fullWidth
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
                                    ml: 2,
                                    "& .MuiInputBase-input": {
                                        fontSize: "2rem",
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
                                    }}
                                >
                                    <Typography
                                        fontSize="1.8rem"
                                        fontWeight="bold"
                                        fontFamily='"Source Code Pro", monospace'
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
                                        fontSize="1.8rem"
                                        fontWeight="bold"
                                        fontFamily='"Source Code Pro", monospace'
                                    >
                                        {date.format("MMM, YYYY")}
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        mb: 2,
                                    }}
                                >
                                    <Typography
                                        fontSize="1.5rem"
                                        fontFamily='"Source Code Pro", monospace'
                                    >
                                        {languages.join(", ")}
                                    </Typography>
                                    <Typography
                                        fontSize="1.5rem"
                                        fontFamily='"Source Code Pro", monospace'
                                    >
                                        {technologies.join(", ")}
                                    </Typography>
                                </Box>
                                <Typography
                                    fontSize="1.3rem"
                                    fontFamily='"Source Code Pro", monospace'
                                    sx={{ pl: "10%" }}
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
