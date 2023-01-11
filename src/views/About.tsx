import { Container, Link as MuiLink, Paper, Typography } from "@mui/material";

import { Helmet } from "react-helmet-async";

const links: { name: string; url: string }[] = [
    { name: "github", url: "https://github.com/paulwrubel" },
    { name: "linkedin", url: "https://www.linkedin.com/in/pauljwrubel/" },
];

const ManSection = ({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) => {
    return (
        <>
            <Typography
                variant="body1"
                fontSize="1.3rem"
                fontWeight="bold"
                fontFamily='"Source Code Pro", monospace'
            >
                {title.toUpperCase()}
            </Typography>
            <Typography
                gutterBottom
                component="div"
                variant="body1"
                fontSize="1.3rem"
                fontFamily='"Source Code Pro", monospace'
                sx={{ pl: "8%" }}
            >
                {"\t"}
                {children}
            </Typography>
        </>
    );
};

const ManSubsection = ({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) => {
    return (
        <>
            <Typography
                variant="body1"
                fontSize="1.3rem"
                fontWeight="bold"
                fontFamily='"Source Code Pro", monospace'
            >
                {title}
            </Typography>
            <Typography
                gutterBottom
                variant="body1"
                fontSize="1.3rem"
                fontFamily='"Source Code Pro", monospace'
                sx={{ pl: "8%" }}
            >
                {"\t"}
                {children}
            </Typography>
        </>
    );
};

const About = () => {
    return (
        <>
            <Helmet>
                <title>{"> about | paul wrubel"}</title>
            </Helmet>
            <Container sx={{ my: 10 }}>
                <Paper variant="outlined" elevation={0} sx={{ p: 2, m: 2 }}>
                    <Typography
                        variant="h1"
                        fontSize="2rem"
                        // gutterBottom
                        fontFamily='"Source Code Pro", monospace'
                    >
                        {"> man paul-wrubel"}
                    </Typography>
                </Paper>
                <Paper variant="outlined" elevation={0} sx={{ p: 2, m: 2 }}>
                    <ManSection title="name">
                        Paul Wrubel - software engineer and technology
                        enthusiast
                    </ManSection>
                    <ManSection title="description">
                        Paul Wrubel is a software engineer from Michigan. He
                        attended Michigan Technology University where he
                        graduated with a B.S. in Computer Science and a Minor in
                        Mathematics. During this, he served as a Software
                        Engineering Intern at Vertafore in East Lansing,
                        Michigan.
                        <br />
                        <br />
                        Currently, he works as a Senior Software Engineer at
                        Target Corporation in Minneapolis, Minnesota, where he
                        works on maintaining observability data within the
                        company.
                        <br />
                        <br />
                        Outside of software, Paul enjoys playing video games,
                        playing with his cats, rollerblading, and baking.
                    </ManSection>
                    <ManSection title="attributes">
                        All are listed in order of most to least experience.
                        <br />
                        <br />
                        <ManSubsection title="Languages">
                            golang, typescript, javascript, python, java, scala,
                            c
                        </ManSubsection>
                        <ManSubsection title="Technologies">
                            git, docker, react, unix, sql, rest, unity3d
                        </ManSubsection>
                        <ManSubsection title="Skills">
                            communication, knowledge sharing, problem solving,
                            prioritizing
                        </ManSubsection>
                    </ManSection>

                    <ManSection title="see also">
                        {links.map(({ name, url }, i) => (
                            <span key={name}>
                                <MuiLink href={url} fontWeight="bold">
                                    {name}
                                </MuiLink>
                                {i !== links.length - 1 ? ", " : ""}
                            </span>
                        ))}
                    </ManSection>
                </Paper>
            </Container>
        </>
    );
};

export default About;
