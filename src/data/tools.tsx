import MergeMania from "components/tools/MergeMania";
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
        name: "merge-mania",
        description: "a merge game.",
        component: <MergeMania />,
    },
];

export type { Tool };
export default tools;
