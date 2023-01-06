import { Container, Paper, Typography } from "@mui/material";

const Tools = () => {
    return (
        <Container sx={{ my: 10 }}>
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
                    Tools coming soon...
                </Typography>
            </Paper>
        </Container>
    );
};

export default Tools;
