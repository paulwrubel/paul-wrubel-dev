/* eslint-disable sonarjs/no-duplicate-string */
import { useState } from "react";

import MenuIcon from "@mui/icons-material/Menu";
import {
    Box,
    Drawer,
    IconButton,
    Paper,
    Toolbar,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { Link, useMatch } from "react-router-dom";

const NavTab = ({
    to,
    selected,
    children,
}: {
    to: string;
    selected?: boolean | null;
    children: React.ReactNode;
}) => {
    const theme = useTheme();
    return (
        <Box
            component={Link}
            to={to}
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: 126,
                height: 50,
                mx: "2px",
                textDecoration: "none",
                // fontFamily: '"Source Code Pro", monospace',
                fontSize: "1.3rem",
                color: "black",
                boxSizing: "content-box",
                borderTop: selected
                    ? `6px solid ${theme.palette.primary.main}`
                    : "6px solid transparent",
                borderBottom: "6px solid transparent",

                ":hover": {
                    borderBottom: `6px solid ${theme.palette.primary.main}`,
                    transition: "border-bottom-color 200ms ease-out",
                },
            }}
        >
            <Box
                sx={{
                    textAlign: "center",
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

const NavBar = () => {
    const match = useMatch("/*");
    const theme = useTheme();
    const isBelowSmallBreakpoint = useMediaQuery(theme.breakpoints.down("sm"));

    const [isResponsiveDrawerOpen, setIsResponsiveDrawerOpen] = useState(false);

    const logoBox = (
        <Typography
            color="black"
            noWrap
            fontSize="1.6rem"
            fontWeight="200"
            fontFamily='"Source Code Pro", monospace'
        >
            {"> paul wrubel"}
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
            name: "tools",
            to: "/tools",
            selected: match?.pathname.startsWith("/tools"),
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
                // overflowX: "hidden",
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
                    <Drawer
                        anchor="left"
                        open={isResponsiveDrawerOpen}
                        onClose={() => {
                            setIsResponsiveDrawerOpen(false);
                        }}
                        PaperProps={{
                            sx: {
                                minWidth: "60vw",
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
                        {navTabs.map(({ name, to, selected, displayName }) => {
                            const backgroundColor = selected
                                ? theme.palette.secondary.darker
                                : theme.palette.secondary.darkest;
                            const hoverColor = selected
                                ? theme.palette.secondary.dark
                                : theme.palette.secondary.darker;
                            return (
                                <Box
                                    key={name}
                                    component={Link}
                                    onClick={() => {
                                        setIsResponsiveDrawerOpen(
                                            !isResponsiveDrawerOpen,
                                        );
                                    }}
                                    to={to}
                                    sx={{
                                        p: 2,

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
                                        {displayName}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Drawer>
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
                        <NavTab key={name} selected={selected} to={to}>
                            {displayName}
                        </NavTab>
                    ))}
                </>
            )}
        </Box>
    );
};

export default NavBar;
