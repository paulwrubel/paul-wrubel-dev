import Bezier from "tools/Bezier";
import FABRIK from "tools/FABRIK";
import MergeMania from "tools/MergeMania";
import MergeManiaProto from "tools/MergeManiaProto";
import PeerPong from "tools/PeerPong";

type Tool = {
    name: string;
    description: string;
    component: React.ReactNode;
};

const tools: Tool[] = [
    // {
    //     name: "traffic-sim",
    //     description:
    //         'a basic 2d traffic simulator. this is a different project than the "traffic-sim" listed under projects.',
    //     component: <TrafficSim />,
    // },
    {
        name: "merge-mania-proto",
        description: "a prototype merge game, built completely in react.",
        component: <MergeManiaProto />,
    },
    {
        name: "merge-mania",
        description: "a merge game, built in p5.js. it's better this time!",
        component: <MergeMania />,
    },
    {
        name: "fabrik",
        description: "forward and backward reaching inverse kinematics solver.",
        component: <FABRIK />,
    },
    {
        name: "bezier",
        description: "an n-th dimensional bezier curve demonstration.",
        component: <Bezier />,
    },
    {
        name: "peer-pong",
        description:
            "pong, but multiplayer! so, basically just regular pong. built using PeerJS",
        component: <PeerPong />,
    },
];

export type { Tool };
export default tools;
