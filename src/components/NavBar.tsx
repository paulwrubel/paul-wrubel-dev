import { Box, Typography } from "@mui/material";
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
    console.log(match);
    const theme = useTheme();
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
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    flexGrow: "1",
                    height: 1,
                    p: 2,
                }}
            >
                <Typography
                    color="black"
                    noWrap
                    fontSize="1.6rem"
                    fontWeight="200"
                    fontFamily='"Source Code Pro", monospace'
                >
                    {"> paul wrubel"}
                </Typography>
            </Box>
            <NavTab selected={match?.pathname === "/"} to="/">
                {">home"}
            </NavTab>
            <NavTab selected={match?.pathname === "/about"} to="/about">
                {">about"}
            </NavTab>
            <NavTab selected={match?.pathname === "/projects"} to="/projects">
                {">projects"}
            </NavTab>
            <NavTab selected={match?.pathname.startsWith("/tools")} to="/tools">
                {">tools"}
            </NavTab>
        </Box>
    );
};

export default NavBar;
