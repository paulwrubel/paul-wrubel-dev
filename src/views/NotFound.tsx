import { Box, Container, Typography } from "@mui/material";

import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <>
            <Helmet>
                <title>{"> 404 | paul leclair"}</title>
            </Helmet>
            <Container sx={{ py: 20 }}>
                <Box sx={{ m: 10 }}>
                    <Typography variant="h1" align="center">
                        It looks like you&apos;re lost...
                    </Typography>
                </Box>
                <Box sx={{ m: 10 }}>
                    <Typography
                        paragraph
                        variant="body1"
                        align="center"
                        fontSize="1.5rem"
                    >
                        The page you&apos;re looking for doesn&apos;t exist.
                    </Typography>
                    <Typography
                        paragraph
                        variant="body1"
                        align="center"
                        fontSize="1.5rem"
                    >
                        Go back <Link to="/">home</Link>
                    </Typography>
                </Box>
            </Container>
        </>
    );
};

export default NotFound;
