/* eslint-disable sonarjs/no-duplicate-string */
import { Fragment, useState } from "react";

import MenuIcon from "@mui/icons-material/Menu";
import {
    Box,
    Drawer,
    IconButton,
    Toolbar,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { Link, useMatch } from "react-router-dom";

import NavBarResponsiveDrawer from "components/NavBarResponsiveDrawer";
import allTools from "data/tools";

const NavBar = () => {
    const match = useMatch("/*");
    const toolMatch = useMatch("/tools/:tool");

    const theme = useTheme();
    const isBelowSmallBreakpoint = useMediaQuery(theme.breakpoints.down("sm"));

    const [isResponsiveDrawerOpen, setIsResponsiveDrawerOpen] = useState(false);

    const [isToolsDrawerOpen, setIsToolsDrawerOpen] = useState(false);

    const toolList = allTools
        .slice()
        .sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));

    const logoBox = (
        <Typography
            color="black"
            noWrap
            fontSize="1.6rem"
            fontWeight="200"
            fontFamily='"Source Code Pro", monospace'
            sx={{ userSelect: "none" }}
        >
            {"> paul leclair"}
        </Typography>
    );

    const navTabs: {
        name: string;
        to: string;
        selected?: boolean;
        displayName: string;
    }[] = [
        {
            name: "home",
            to: "/",
            selected: match?.pathname === "/",
            displayName: ">home",
        },
        {
            name: "about",
            to: "/about",
            selected: match?.pathname === "/about",
            displayName: ">about",
        },
        {
            name: "projects",
            to: "/projects",
            selected: match?.pathname === "/projects",
            displayName: ">projects",
        },
        {
            name: "genuary",
            to: "/genuary",
            selected: match?.pathname === "/genuary",
            displayName: ">genuary",
        },
        {
            name: "tools",
            to: "/tools",
            selected: isBelowSmallBreakpoint
                ? match?.pathname === "/tools"
                : match?.pathname.startsWith("/tools"),
            displayName: ">tools",
        },
    ];

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100vw",
                height: 60,
                px: 3,
                backgroundColor: "white",
                fontFamily: '"Source Code Pro", monospace',
                position: "sticky",
                top: 0,
                zIndex: theme.zIndex.drawer + 1,
            }}
        >
            {isBelowSmallBreakpoint ? (
                <>
                    <IconButton
                        size="large"
                        edge="start"
                        aria-label="menu"
                        onClick={() => {
                            setIsResponsiveDrawerOpen(!isResponsiveDrawerOpen);
                        }}
                        sx={{ mr: 2, color: "black" }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            width: 1,
                            justifyContent: "flex-end",
                        }}
                    >
                        {logoBox}
                    </Box>
                    <NavBarResponsiveDrawer
                        key="this is a key"
                        isOpen={isResponsiveDrawerOpen}
                        setIsOpen={setIsResponsiveDrawerOpen}
                        navTabs={navTabs}
                    />
                </>
            ) : (
                <>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            flexGrow: "1",
                            height: 1,
                            p: isBelowSmallBreakpoint ? 1 : 2,
                        }}
                    >
                        {logoBox}
                    </Box>
                    {navTabs.map(({ name, to, selected, displayName }) => (
                        <Fragment key={name}>
                            <Box
                                key={name}
                                component={name === "tools" ? "div" : Link}
                                to={to}
                                onClick={() => {
                                    if (name === "tools") {
                                        setIsToolsDrawerOpen(
                                            !isToolsDrawerOpen,
                                        );
                                    }
                                }}
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    width: 126,
                                    height: 1,
                                    textDecoration: "none",
                                    fontSize: "1.3rem",
                                    color: "black",
                                    userSelect: "none",
                                    backgroundColor: selected ? "#DDD" : "#FFF",
                                    ":hover": {
                                        backgroundColor: selected
                                            ? "#BBB"
                                            : "#DDD",
                                    },
                                }}
                            >
                                {displayName}
                            </Box>
                        </Fragment>
                    ))}
                    <Drawer
                        open={isToolsDrawerOpen}
                        anchor="right"
                        onClose={() => {
                            setIsToolsDrawerOpen(false);
                        }}
                        PaperProps={{
                            sx: {
                                boxSizing: "border-box",
                                backgroundImage: "none",
                                backgroundColor:
                                    theme.palette.secondary.darkest,
                                // gap: 1,
                                // p: "2px",
                            },
                        }}
                    >
                        <Toolbar />
                        {toolList.map((tool) => {
                            const isToolSelected =
                                toolMatch?.params?.tool === tool.name;
                            const backgroundColor = isToolSelected
                                ? theme.palette.secondary.darker
                                : theme.palette.secondary.darkest;

                            const hoverColor = isToolSelected
                                ? theme.palette.secondary.dark
                                : theme.palette.secondary.darker;
                            return (
                                <Box
                                    key={tool.name}
                                    component={Link}
                                    onClick={() => {
                                        setIsToolsDrawerOpen(false);
                                    }}
                                    to={`/tools/${tool.name}`}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        p: 2,

                                        userSelect: "none",
                                        textDecoration: "none",

                                        border: "1px solid #000",

                                        backgroundColor: backgroundColor,
                                        ":hover": {
                                            backgroundColor: hoverColor,
                                        },
                                    }}
                                >
                                    <Typography
                                        color={theme.palette.getContrastText(
                                            backgroundColor as string,
                                        )}
                                        fontFamily='"Source Code Pro", monospace'
                                        fontSize="1.5rem"
                                    >
                                        {`>${tool.name}`}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Drawer>
                </>
            )}
        </Box>
    );
};

export default NavBar;
