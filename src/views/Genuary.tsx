import {
    Box,
    Container,
    Link as MuiLink,
    Paper,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";

import { Helmet } from "react-helmet-async";

import daysData, { AuthorsLinks } from "data/genuary-23";

const Genuary = () => {
    const theme = useTheme();
    const isBelowMediumBreakpoint = useMediaQuery(theme.breakpoints.down("md"));

    const fontSizePrimary = isBelowMediumBreakpoint ? "1.6rem" : "2rem";
    const fontSizeSecondary = isBelowMediumBreakpoint ? "1rem" : "1.8rem";
    const fontSizeTertiary = isBelowMediumBreakpoint ? "1rem" : "1.5rem";
    const fontSizeBody = isBelowMediumBreakpoint ? "1rem" : "1.3rem";

    const days = daysData
        .slice()
        .filter((d) => d.entries && d.entries.length > 0);

    return (
        <>
            <Helmet>
                <title>{"> genuary | paul wrubel"}</title>
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
                    <Typography
                        // flexGrow={1}
                        // flexShrink={0}
                        // noWrap
                        variant="h1"
                        fontSize={fontSizePrimary}
                        fontFamily='"Source Code Pro", monospace'
                        sx={{ overflowWrap: "normal" }}
                    >
                        {"> ./genuary list 2023"}
                    </Typography>
                </Paper>
                <Paper
                    variant="outlined"
                    elevation={0}
                    sx={{
                        py: 4,
                        px: "10%",
                        mx: 2,
                        my: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                        }}
                    >
                        <Typography
                            // flexGrow={1}
                            // flexShrink={0}
                            // noWrap
                            variant="h1"
                            fontSize={fontSizeTertiary}
                            fontFamily='"Source Code Pro", monospace'
                            sx={{ overflowWrap: "normal" }}
                        >
                            <MuiLink>Genuary</MuiLink> is an advent-like project
                            during the month of January which supplies prompts
                            for inspiring computer-generated art pieces.
                        </Typography>
                        <Typography
                            // flexGrow={1}
                            // flexShrink={0}
                            // noWrap
                            variant="h1"
                            fontSize={fontSizeTertiary}
                            fontFamily='"Source Code Pro", monospace'
                            sx={{ overflowWrap: "normal" }}
                        >
                            These are contribution for 2023 from myself and{" "}
                            <MuiLink
                                target="_blank"
                                rel="noreferrer"
                                href={AuthorsLinks["Selam Berhea"]}
                            >
                                Selam Berhea
                            </MuiLink>
                            .
                        </Typography>
                    </Box>
                </Paper>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {days.map(({ day, prompt, entries }) => (
                        <Paper
                            key={day}
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
                                    fontSize={fontSizeTertiary}
                                    fontWeight="bold"
                                    fontFamily='"Source Code Pro", monospace'
                                    sx={{ flexGrow: 1 }}
                                >
                                    Day {day} | {prompt}
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    justifyContent: "space-around",
                                    alignItems: "center",
                                    pt: 2,
                                    gap: 1,
                                }}
                            >
                                {entries?.map(
                                    ({
                                        name,
                                        author,
                                        description,
                                        component,
                                    }) => (
                                        <Box
                                            key={`${day}-${author}-${name}`}
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                gap: 1,
                                            }}
                                        >
                                            {component}

                                            <Box
                                                key={`${day}-${author}-${name}`}
                                                sx={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    gap: 0,
                                                }}
                                            >
                                                <Typography
                                                    fontSize={fontSizeSecondary}
                                                    fontFamily='"Source Code Pro", monospace'
                                                >
                                                    <MuiLink
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        href={
                                                            AuthorsLinks[author]
                                                        }
                                                    >
                                                        {author}
                                                    </MuiLink>
                                                </Typography>
                                                <Typography
                                                    fontSize={fontSizeTertiary}
                                                    fontFamily='"Source Code Pro", monospace'
                                                >
                                                    {name}
                                                </Typography>
                                                <Typography
                                                    fontSize={fontSizeTertiary}
                                                    fontFamily='"Source Code Pro", monospace'
                                                >
                                                    {description}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ),
                                )}
                            </Box>
                        </Paper>
                    ))}
                </Box>
            </Container>
        </>
    );
};

export default Genuary;
