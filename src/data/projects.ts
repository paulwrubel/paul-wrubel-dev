/* eslint-disable sonarjs/no-duplicate-string */
import dayjs from "dayjs";

type Project = {
    name: string;
    description: string;
    date: dayjs.Dayjs;
    technologies: string[];
    languages: string[];
    link?: string;
    codeLink: string;
};

const projects: Project[] = [
    {
        name: "luxide (ui)",
        description: `A UI for the luxide pathtracing engine, written in Svelte.`,
        date: dayjs("2023-11-18", "YYYY-MM-DD"),
        technologies: [],
        languages: ["svelte"],
        link: "https://luxide-dev.paulleclair.dev/",
        codeLink: "https://github.com/paulwrubel/luxide",
    },
    {
        name: "advent of code 2023",
        description: `Solutions for the puzzles from Advent of Code, 2023. All solutions are written in Rust.`,
        date: dayjs("2023-12-01", "YYYY-MM-DD"),
        technologies: [],
        languages: ["rust"],
        codeLink: "https://github.com/paulwrubel/advent-of-code-2023",
    },
    {
        name: "luxide",
        description: `A pathtracer, written in Rust, executed as a compiled binary on a CPU. 
            It is the fastest raytracer I've yet written, by far.`,
        date: dayjs("2023-11-18", "YYYY-MM-DD"),
        technologies: [],
        languages: ["rust"],
        codeLink: "https://github.com/paulwrubel/luxide",
    },
    {
        name: "stroll",
        description: `A esoteric programming language I wrote for fun. It's grid-based, inspired by fsh and befunge.
            It also features an amusing "lore" associated with the language.`,
        date: dayjs("2023-09-18", "YYYY-MM-DD"),
        technologies: [],
        languages: ["golang"],
        codeLink: "https://github.com/paulwrubel/stroll",
    },
    {
        name: "lecture",
        description: `A esoteric programming language I wrote for fun. It's designed to emulate natural(ish) speech.`,
        date: dayjs("2023-09-15", "YYYY-MM-DD"),
        technologies: ["ANTLR4"],
        languages: ["golang"],
        codeLink: "https://github.com/paulwrubel/lecture",
    },
    {
        name: "merge mania",
        description: `A port of my "Merge Mania" game, built in the Godot game engine. 
            A version of this game can be found here as well, under "tools" -> "merge-mania".`,
        date: dayjs("2023-08-07", "YYYY-MM-DD"),
        technologies: ["godot"],
        languages: ["gdscript"],
        codeLink: "https://github.com/paulwrubel/merge-mania",
    },
    {
        name: "paulleclair.dev",
        description: `A simple website to represent myself and my work. It's what you're looking at right now!
            It additionally serves the purpose of hosting some tools I wrote and didn't know where else to put.`,
        date: dayjs("2023-01-05", "YYYY-MM-DD"),
        technologies: ["react"],
        languages: ["typescript", "javascript", "css"],
        link: "https://www.paulleclair.dev/",
        codeLink: "https://github.com/paulwrubel/paul-wrubel-dev",
    },
    {
        name: "solid budget",
        description: `A budgeting client written as a React single-page application. It is currently a work in progress.
            Designed to emulate features of other common budgeting programs, such as YNAB and Financier.io, it supports 
            features like accounts, categories, and transactions.`,
        date: dayjs("2022-02-27", "YYYY-MM-DD"),
        technologies: ["react"],
        languages: ["typescript", "javascript", "css"],
        link: "https://app.solidbudget.io/",
        codeLink: "https://github.com/paulwrubel/solid-budget-client",
    },
    {
        name: "too many cookies",
        description: `A helper tool to calculate statistics and suggestion on cookie clicker actions. 
            It is aimed at maximizing the value of the next action or purchase.`,
        date: dayjs("2021-10-28", "YYYY-MM-DD"),
        technologies: ["github copilot"],
        languages: ["python"],
        codeLink: "https://github.com/paulwrubel/too-many-cookies",
    },
    {
        name: "video download agent",
        description: `An agent, backed by yt-dlp, designed to download videos on an interval via polling, 
            based on a configuration file.
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
        description: `An agent that collects disk usage of folders and file on a system on an interval, 
            based on a configuration file.
            This data is then reported to an InfluxDB instance as metrics.`,
        date: dayjs("2021-06-02", "YYYY-MM-DD"),
        technologies: ["docker", "influxdb"],
        languages: ["golang"],
        codeLink:
            "https://github.com/paulwrubel/directory-size-metrics-collector",
    },
    {
        name: "bloom",
        description: `A React app to showcase various processing / p5js sketches I have created. 
            These are collated into a common page, from which you can select and interact with any of the available sketches. 
            This is an improved iteration of the Vixuals project.`,
        date: dayjs("2021-04-30", "YYYY-MM-DD"),
        technologies: ["react", "p5js"],
        languages: ["typescript", "javascript", "css"],
        link: "https://bloom.paulleclair.com/",
        codeLink: "https://github.com/paulwrubel/bloom",
    },
    {
        name: "vixuals",
        description: `A React app to showcase various processing / p5js sketches I have created. 
            This is a precursor to what would eventually become the Bloom project.`,
        date: dayjs("2020-02-09", "YYYY-MM-DD"),
        technologies: ["react", "p5js"],
        languages: ["typescript", "javascript", "css"],
        link: "https://vixuals.paulleclair.com/",
        codeLink: "https://github.com/paulwrubel/vixuals",
    },
    {
        name: "photolum",
        description: `A pathtracer, written purely in Golang, operated from a structured REST API. 
            One of my most favourite projects ever completed.
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
        description: `A VR sandbox to showcase various game design and VR features, written in Unity3D. 
            A short-but-sweet school project.`,
        date: dayjs("2019-04-01", "YYYY-MM-DD"),
        technologies: ["unity3d", "virtual reality"],
        languages: ["c#"],
        codeLink: "https://github.com/paulwrubel/vr-playground",
    },
    {
        name: "luminescence",
        description: `A pathtracer, written purely in Scala, operated as an in-IDE program. 
            It is the inspiration for the Fluorescence project.`,
        date: dayjs("2018-11-04", "YYYY-MM-DD"),
        technologies: [],
        languages: ["scala"],
        codeLink: "https://github.com/paulwrubel/luminescence",
    },
    {
        name: "hilbert curves",
        description: `A simple project to demonstrate the Hilbert Curve.`,
        date: dayjs("2018-11-03", "YYYY-MM-DD"),
        technologies: ["javafx"],
        languages: ["scala"],
        codeLink: "https://github.com/paulwrubel/hilbert-curves",
    },
    {
        name: "art generator s",
        description: `A Scala version of the now-ancient Java-based Art Generator project. 
            It generates art! A modern version of this is included as an applet in the Bloom project.`,
        date: dayjs("2018-03-10", "YYYY-MM-DD"),
        technologies: ["javafx"],
        languages: ["scala"],
        codeLink: "https://github.com/paulwrubel/art-generator-s",
    },
];

export type { Project };
export default projects;
