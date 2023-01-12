import MergeManiaProto from "components/tools/MergeManiaProto";
import MergeManiaS from "components/tools/MergeManiaS";
import TrafficSim from "components/tools/TrafficSim";

type Tool = {
    name: string;
    description: string;
    component: React.ReactNode;
};

const tools: Tool[] = [
    {
        name: "traffic-sim",
        description:
            'a basic 2d traffic simulator. this is a different project than the "traffic-sim" listed under projects.',
        component: <TrafficSim />,
    },
    {
        name: "merge-mania-proto",
        description: "a prototype merge game, built completely in react.",
        component: <MergeManiaProto />,
    },
    {
        name: "merge-mania-s",
        description: "a merge game, built in p5.js. It's better this time!",
        component: <MergeManiaS />,
    },
];

export type { Tool };
export default tools;
