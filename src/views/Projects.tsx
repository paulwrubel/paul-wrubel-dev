/* eslint-disable sonarjs/no-duplicate-string */
import {
    Box,
    Container,
    Link as MuiLink,
    Paper,
    Typography,
} from "@mui/material";

import dayjs from "dayjs";

const projectList: {
    name: string;
    description: string;
    date: dayjs.Dayjs;
    technologies: string[];
    languages: string[];
    link?: string;
    codeLink: string;
}[] = [
    {
        name: "paulwrubel.dev",
        description: `A simple website to represent myself and my work. It's what you're looking at right now!
            It additionally serves the purpose of hosting some tools I wrote and didn't know where else to put.`,
        date: dayjs("2023-01-05", "YYYY-MM-DD"),
        technologies: ["react"],
        languages: ["typescript", "javascript", "css"],
        link: "https://www.paulwrubel.dev/",
        codeLink: "https://github.com/paulwrubel/paul-wrubel-dev",
    },
    {
        name: "solid budget",
        description: `A budgeting client written as a React single-page application. It is currently a work in progress.
        Designed to emulate features of other common budgeting programs, such as YNAB and Financier.io, it supports features like accounts, categories, and transactions.`,
        date: dayjs("2022-02-27", "YYYY-MM-DD"),
        technologies: ["react"],
        languages: ["typescript", "javascript", "css"],
        link: "https://app.solidbudget.io/",
        codeLink: "https://github.com/paulwrubel/solid-budget-client",
    },
    {
        name: "too many cookies",
        description: `A helper tool to calculate statistics and suggestion on cookie clicker actions. It is aimed at maximizing the value of the next action or purchase.`,
        date: dayjs("2021-10-28", "YYYY-MM-DD"),
        technologies: ["github copilot"],
        languages: ["python"],
        codeLink: "https://github.com/paulwrubel/too-many-cookies",
    },
    {
        name: "video download agent",
        description: `An agent, backed by yt-dlp, designed to download videos on an interval via polling, based on a configuration file.
        It is used mainly for scraping YouTube channels for new videos`,
        date: dayjs("2021-07-03", "YYYY-MM-DD"),
        technologies: ["docker", "yt-dlp"],
        languages: ["python"],
        codeLink: "https://github.com/paulwrubel/video-download-agent",
    },
    {
        name: "brittlewing",
        description: `An unfinished Unity game about breeding flower, using mechanisms found commonly in Animal Crossing.`,
        date: dayjs("2021-08-08", "YYYY-MM-DD"),
        technologies: ["unity3d"],
        languages: ["c#"],
        codeLink: "https://github.com/paulwrubel/brittlewing-game",
    },
    {
        name: "directory size metrics collector",
        description: `An agent that collects disk usage of folders and file on a system on an interval, based on a configuration file.
        This data is then reported to an InfluxDB instance as metrics.`,
        date: dayjs("2021-06-02", "YYYY-MM-DD"),
        technologies: ["docker", "influxdb"],
        languages: ["golang"],
        codeLink:
            "https://github.com/paulwrubel/directory-size-metrics-collector",
    },
    {
        name: "bloom",
        description: `A React app to showcase various processing / p5js sketches I have created. These are collated into a common page, from which you can 
        select and interact with any of the available sketches. This is an improved iteration of the Vixuals project.`,
        date: dayjs("2021-04-30", "YYYY-MM-DD"),
        technologies: ["react", "p5js"],
        languages: ["typescript", "javascript", "css"],
        link: "https://bloom.voxaelfox.com/",
        codeLink: "https://github.com/paulwrubel/bloom",
    },
    {
        name: "vixuals",
        description: `A React app to showcase various processing / p5js sketches I have created. This is a precursor to what would eventually become the Bloom project.`,
        date: dayjs("2020-02-09", "YYYY-MM-DD"),
        technologies: ["react", "p5js"],
        languages: ["typescript", "javascript", "css"],
        link: "https://vixuals.voxaelfox.com/",
        codeLink: "https://github.com/paulwrubel/vixuals",
    },
    {
        name: "photolum",
        description: `A pathtracer, written purely in Golang, operated from a structured REST API. One of my most favourite projects ever completed.
        This is an advanced, persistance, backend version of the Fluorescence project.`,
        date: dayjs("2020-09-23", "YYYY-MM-DD"),
        technologies: ["postgresql", "rest"],
        languages: ["golang"],
        codeLink: "https://github.com/paulwrubel/photolum",
    },
    {
        name: "fluorescence",
        description: `A pathtracer, written purely in Golang, operated as an executable binary.
        It is the spiritual successor of the Luminescence project, and the precursor to the photolum project.`,
        date: dayjs("2019-12-03", "YYYY-MM-DD"),
        technologies: [],
        languages: ["golang"],
        codeLink: "https://github.com/paulwrubel/fluorescence",
    },
    {
        name: "asciify",
        description: `Create ASCII art easily. A very, very simple project.`,
        date: dayjs("2019-12-02", "YYYY-MM-DD"),
        technologies: [],
        languages: ["golang"],
        codeLink: "https://github.com/paulwrubel/asciify",
    },
    {
        name: "traffic sim",
        description: `A very simplistic (and broken and unfinished) traffic simulator written in python.`,
        date: dayjs("2019-09-30", "YYYY-MM-DD"),
        technologies: [],
        languages: ["python"],
        codeLink: "https://github.com/paulwrubel/traffic-sim",
    },
    {
        name: "vr playground",
        description: `A VR sandbox to showcase various game design and VR features, written in Unity3D. A short-but-sweet school project.`,
        date: dayjs("2019-04-01", "YYYY-MM-DD"),
        technologies: ["unity3d", "virtual reality"],
        languages: ["c#"],
        codeLink: "https://github.com/paulwrubel/vr-playground",
    },
    {
        name: "luminescence",
        description: `A pathtracer, written purely in Scala, operated as an in-IDE program. It is the inspiration for the Fluorescence project.`,
        date: dayjs("2018-11-04", "YYYY-MM-DD"),
        technologies: [],
        languages: ["scala"],
        codeLink: "https://github.com/paulwrubel/luminescence",
    },
    {
        name: "hillbert curves",
        description: `A simple project to demonstrate Hillbert Curves.`,
        date: dayjs("2018-11-03", "YYYY-MM-DD"),
        technologies: ["javafx"],
        languages: ["scala"],
        codeLink: "https://github.com/paulwrubel/hillbert-curves",
    },
    {
        name: "art generator s",
        description: `A Scala version of the now-ancient Java-based Art Generator project. It generates art!
        A modern version of this is included as an applet in the Bloom project.`,
        date: dayjs("2018-03-10", "YYYY-MM-DD"),
        technologies: ["javafx"],
        languages: ["scala"],
        codeLink: "https://github.com/paulwrubel/art-generator-s",
    },
];

const Projects = () => {
    const sortedProjects = projectList
        .slice()
        .sort((a, b) => b.date.diff(a.date, "day"));

    return (
        <Container sx={{ my: 10 }}>
            <Paper variant="outlined" elevation={0} sx={{ p: 2, mx: 2, my: 4 }}>
                <Typography
                    variant="h1"
                    fontSize="2rem"
                    fontFamily='"Source Code Pro", monospace'
                >
                    {"> cat projects"}
                </Typography>
            </Paper>

            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {sortedProjects.map(
                    ({
                        name,
                        description,
                        date,
                        technologies,
                        languages,
                        link,
                        codeLink,
                    }) => (
                        <Paper
                            key={name}
                            variant="outlined"
                            elevation={0}
                            sx={{ p: 2, mx: 2, my: 1 }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Typography
                                    fontSize="1.8rem"
                                    fontWeight="bold"
                                    fontFamily='"Source Code Pro", monospace'
                                >
                                    {link ? (
                                        <MuiLink href={link}>{name}</MuiLink>
                                    ) : (
                                        name
                                    )}{" "}
                                    | <MuiLink href={codeLink}>source</MuiLink>
                                </Typography>
                                <Typography
                                    fontSize="1.8rem"
                                    fontWeight="bold"
                                    fontFamily='"Source Code Pro", monospace'
                                >
                                    {date.format("MMM, YYYY")}
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mb: 2,
                                }}
                            >
                                <Typography
                                    fontSize="1.5rem"
                                    fontFamily='"Source Code Pro", monospace'
                                >
                                    {languages.join(", ")}
                                </Typography>
                                <Typography
                                    fontSize="1.5rem"
                                    fontFamily='"Source Code Pro", monospace'
                                >
                                    {technologies.join(", ")}
                                </Typography>
                            </Box>
                            <Typography
                                fontSize="1.3rem"
                                fontFamily='"Source Code Pro", monospace'
                                sx={{ pl: "10%" }}
                            >
                                {description}
                            </Typography>
                        </Paper>
                    ),
                )}
            </Box>
        </Container>
    );
};

export default Projects;
