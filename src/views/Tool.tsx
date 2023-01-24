import { Box, Container, Paper, Typography } from "@mui/material";

import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";

import toolList from "data/tools";

const Tool = () => {
    const toolName = useParams().tool;

    const tool = toolList.find((t) => t.name === toolName) ?? {
        name: "404-tool-not-found",
        description: "404 Tool not found",
        component: "404",
    };

    return (
        <>
            <Helmet>
                <title>{`> ${tool.name} | paul wrubel`}</title>
            </Helmet>
            <Container sx={{ my: 10, height: "78vh" }}>
                <Box
                    sx={{
                        height: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    <Box sx={{ alignSelf: "center" }}>{tool.component}</Box>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            py: 2,
                        }}
                    >
                        <Paper
                            variant="outlined"
                            elevation={0}
                            sx={{
                                p: 2,
                                mx: 2,
                            }}
                        >
                            <Typography
                                // align="left"
                                fontSize="2.5rem"
                                fontFamily='"Source Code Pro", monospace'
                            >
                                {tool.name}
                            </Typography>
                        </Paper>
                        <Paper
                            variant="outlined"
                            elevation={0}
                            sx={{
                                p: 2,
                                mx: 2,
                            }}
                        >
                            <Typography
                                // align="left"
                                fontSize="1rem"
                                fontFamily='"Source Code Pro", monospace'
                            >
                                {tool.description}
                            </Typography>
                        </Paper>
                    </Box>
                </Box>
            </Container>
        </>
    );
};

export default Tool;
