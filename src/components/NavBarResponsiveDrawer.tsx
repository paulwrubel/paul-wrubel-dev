import { useState } from "react";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import {
    Box,
    Collapse,
    Drawer,
    Toolbar,
    Typography,
    useTheme,
} from "@mui/material";

import { Link, useMatch } from "react-router-dom";

import allTools from "data/tools";

const NavBarResponsiveDrawer = ({
    isOpen,
    setIsOpen,
    navTabs,
}: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    navTabs: {
        name: string;
        to: string;
        selected?: boolean;
        displayName: string;
    }[];
}) => {
    const theme = useTheme();
    const toolMatch = useMatch("/tools/:tool");

    const [isToolsCollapseOpen, setIsToolsCollapseOpen] = useState(false);

    const toolList = allTools
        .slice()
        .sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));

    return (
        <Drawer
            anchor="left"
            open={isOpen}
            onClose={() => {
                setIsOpen(false);
            }}
            PaperProps={{
                sx: {
                    minWidth: "60vw",
                    boxSizing: "border-box",
                    backgroundImage: "none",
                    backgroundColor: theme.palette.secondary.darkest,
                    // gap: 1,
                    // p: "2px",
                },
            }}
        >
            <Toolbar />
            {/* eslint-disable-next-line sonarjs/cognitive-complexity */}
            {navTabs.map(({ name, to, selected, displayName }) => {
                const backgroundColor = selected
                    ? theme.palette.secondary.darker
                    : theme.palette.secondary.darkest;

                const hoverColor = selected
                    ? theme.palette.secondary.dark
                    : theme.palette.secondary.darker;

                return (
                    <Box key={name}>
                        <Box
                            key={name}
                            component={name === "tools" ? "div" : Link}
                            onClick={
                                name === "tools"
                                    ? () => {
                                          setIsToolsCollapseOpen(
                                              !isToolsCollapseOpen,
                                          );
                                      }
                                    : () => {
                                          setIsOpen(false);
                                      }
                            }
                            to={to}
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
                                {displayName}
                            </Typography>
                            {name === "tools" &&
                                (isToolsCollapseOpen ? (
                                    <ExpandLess />
                                ) : (
                                    <ExpandMore />
                                ))}
                        </Box>
                        {name === "tools" && (
                            <Collapse
                                in={isToolsCollapseOpen}
                                timeout="auto"
                                easing="ease-out"
                            >
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
                                                setIsOpen(false);
                                            }}
                                            to={`${to}/${tool.name}`}
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                p: 2,
                                                pl: 5,

                                                userSelect: "none",
                                                textDecoration: "none",

                                                border: "1px solid #000",

                                                backgroundColor:
                                                    backgroundColor,
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
                            </Collapse>
                        )}
                    </Box>
                );
            })}
        </Drawer>
    );
};

export default NavBarResponsiveDrawer;
