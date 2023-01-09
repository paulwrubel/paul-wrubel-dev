import { Container, Paper, Typography } from "@mui/material";

const ToolsIndex = () => {
    return (
        <Container sx={{ my: 10, flexGrow: 1 }}>
            <Paper
                variant="outlined"
                elevation={0}
                sx={{
                    p: 2,
                    m: 2,
                }}
            >
                <Typography
                    fontSize="3rem"
                    fontFamily='"Source Code Pro", monospace'
                >
                    select a tool from the right
                </Typography>
            </Paper>
        </Container>
    );
};

export default ToolsIndex;
