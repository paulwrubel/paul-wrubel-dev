import {
    Box,
    Drawer,
    Paper,
    Toolbar,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { Link, Outlet, useMatch } from "react-router-dom";

import allTools from "data/tools";

const Tools = () => {
    const theme = useTheme();
    const isBelowSmallBreakpoint = useMediaQuery(theme.breakpoints.down("sm"));

    const drawerWidth = 400;

    const selectedToolName = useMatch("/tools/:tool")?.params?.tool;

    const toolList = allTools
        .slice()
        .sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));

    return (
        <Box sx={{ display: "flex" }}>
            <Outlet />
            {/* {!isBelowSmallBreakpoint && (
                <Drawer
                    variant="persistent"
                    anchor="right"
                    open={true}
                    PaperProps={{
                        sx: {
                            // borderLeft: "none",
                            width: drawerWidth,
                            boxSizing: "border-box",
                            // backgroundColor: theme.palette.background.default,
                            gap: 1,
                            p: 1,
                        },
                    }}
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                    }}
                >
                    <Toolbar />
                    {toolList.map(({ name }) => (
                        <Paper
                            key={name}
                            to={name}
                            component={Link}
                            variant="outlined"
                            elevation={0}
                            sx={[
                                {
                                    p: 2,
                                    mx: 1,
                                    textDecoration: "none",
                                    "&.Mui-focusVisible, :hover": {
                                        backgroundColor:
                                            selectedToolName === name
                                                ? "#444"
                                                : "#333",
                                    },
                                },
                                selectedToolName === name && {
                                    backgroundColor: "#333",
                                },
                            ]}
                        >
                            <Typography
                                align="left"
                                fontSize="1.5rem"
                                fontFamily='"Source Code Pro", monospace'
                            >
                                {"> " + name}
                            </Typography>
                        </Paper>
                    ))}
                </Drawer>
            )} */}
        </Box>
    );
};

export default Tools;
