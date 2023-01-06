import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { Link } from "react-router-dom";

const NavTab = ({
    to,
    children,
}: {
    to: string;
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
                width: "96px",
                height: "54px",
                mx: "2px",
                textDecoration: "none",
                color: "black",
                boxSizing: "content-box",
                borderBottom: `6px solid transparent`,
                ":hover": {
                    borderBottom: `6px solid ${theme.palette.primary.light}`,
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
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                width: 1,
                height: 60,
                backgroundColor: "white",
            }}
        >
            <NavTab to="/">Home</NavTab>
            <NavTab to="/">About</NavTab>
            <NavTab to="/">Projects</NavTab>
            <NavTab to="/">Tools</NavTab>
        </Box>
    );
};

export default NavBar;
