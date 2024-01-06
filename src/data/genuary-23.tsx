/* eslint-disable sonarjs/no-duplicate-string */
import Day01Paul from "genuaryentries/2023/day01/Paul";
import Day01Selam from "genuaryentries/2023/day01/Selam";

const AuthorsLinks = {
    "Paul Wrubel": "https://github.com/paulwrubel",
    "Selam Berhea": "https://github.com/sberhea",
};
type Author = keyof typeof AuthorsLinks;

type Entry = {
    name: string;
    author: Author;
    description: string;
    component: React.ReactNode;
};

type Day = {
    day: string;
    prompt: string;
    entries?: Entry[];
};

const days: Day[] = [
    {
        day: "1",
        prompt: "Particles, lots of them.",
        entries: [
            {
                name: "Hello 2024!",
                author: "Paul Wrubel",
                description: "a celebration of the new year.",
                component: <Day01Paul />,
            },
            {
                name: "Comets",
                author: "Selam Berhea",
                description: "A bunch of little comets.",
                component: <Day01Selam />,
            },
        ],
    },
    {
        day: "2",
        prompt: "No palettes.",
        entries: [],
    },
    {
        day: "3",
        prompt: "Droste Effect.",
    },
    {
        day: "4",
        prompt: "Pixels",
    },
    {
        day: "5",
        prompt: "In the style of Vera Molnár (1924-2023).",
    },
    {
        day: "6",
        prompt: "Screensaver.",
    },
    {
        day: "7",
        prompt: "Progress bar / indicator / loading animation.",
    },
    {
        day: "8",
        prompt: "Chaotic system.",
    },
    {
        day: "9",
        prompt: "ASCII.",
    },
    {
        day: "10",
        prompt: "Hexagonal.",
    },
    {
        day: "11",
        prompt: "In the style of Anni Albers (1899-1994).",
    },
    {
        day: "12",
        prompt: "Lava lamp.",
    },
    {
        day: "13",
        prompt: "Wobbly function day.",
    },
    {
        day: "14",
        prompt: "Less than 1KB artwork.",
    },
    {
        day: "15",
        prompt: "Use a physics library.",
    },
    {
        day: "16",
        prompt: "Draw 10 000 of something.",
    },
    {
        day: "17",
        prompt: "Inspired by Islamic art.",
    },
    {
        day: "18",
        prompt: "Bauhaus.",
    },
    {
        day: "19",
        prompt: "Flocking.",
    },
    {
        day: "20",
        prompt: "Generative typography.",
    },
    {
        day: "21",
        prompt: "Use a library that you haven’t used before.",
    },
    {
        day: "22",
        prompt: "Point - line - plane.",
    },
    {
        day: "23",
        prompt: "8×8.",
    },
    {
        day: "24",
        prompt: "Impossible objects (undecided geometry).",
    },
    {
        day: "25",
        prompt:
            "If you like generative art, you probably have some photos on your phone of cool " +
            "looking patterns, textures, shapes or things that you’ve seen. You might have even " +
            "thought, “I should try to recreate this with code”. Today is the day.",
    },
    {
        day: "26",
        prompt: "Grow a seed.",
    },
    {
        day: "27",
        prompt: "Code for one hour. At the one hour mark, you’re done.",
    },
    {
        day: "28",
        prompt: "Skeuomorphism.",
    },
    {
        day: "29",
        prompt: "Signed Distance Functions (if we keep trying once per year, eventually we will be good at it!).",
    },
    {
        day: "30",
        prompt: "Shaders.",
    },
    {
        day: "31",
        prompt: "Generative music / Generative audio / Generative sound.",
    },
];

export type { Author, Entry };
export { AuthorsLinks };
export default days;
