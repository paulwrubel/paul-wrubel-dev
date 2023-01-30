import { useState } from "react";

import PendulumSketch from "./PendulumSketch";
import { Arm } from "./types";

const Pendulum = () => {
    const [arms, setArms] = useState<Arm[]>([
        { length: 100, weight: 5, initialAngle: 180 },
        { length: 80, weight: 5, initialAngle: 180 },
        { length: 60, weight: 5, initialAngle: 181 },
    ]);

    return <PendulumSketch arms={arms} />;
};

export default Pendulum;
