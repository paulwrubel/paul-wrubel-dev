import { useState } from "react";

import { Box, Button, Slider, Typography } from "@mui/material";

import { Point } from "toolhelpers/geometry/Point";
import { Vector } from "toolhelpers/geometry/Vector";

// import { Arm } from "./Arm";
import { Pendulum } from "./Pendulum";
import PendulumSketch from "./PendulumSketch";
import { ArmData } from "./types";
// import { Arm } from "./types";

const PendulumComponent = () => {
    const fontFamily = '"Source Code Pro", monospace';

    const width = 500;
    const height = 500;

    const origin = new Point(width / 2, height / 2);
    const gravity = new Vector(0, 1);
    const basisVector = gravity;

    const [armData, setArmData] = useState<ArmData[]>([
        { length: 80, mass: 5, initialAngle: 180 },
        { length: 70, mass: 5, initialAngle: 180 },
        { length: 60, mass: 5, initialAngle: 180.1 },
    ]);
    const [pendulum, setPendulum] = useState<Pendulum>(
        new Pendulum(origin, gravity, basisVector, 50, ...armData),
    );

    const handleResetPendulum = () => {
        setPendulum(new Pendulum(origin, gravity, basisVector, 50, ...armData));
    };

    return (
        <>
            <PendulumSketch width={width} height={height} pendulum={pendulum} />
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: 1,
                    gap: 2,
                }}
            >
                {armData.map((data, i) => (
                    <Box
                        key={`${i}`}
                        sx={{
                            display: "flex",
                            justifyContent: "space-evenly",
                            gap: 2,
                            // width: 1,
                        }}
                    >
                        <Typography
                            noWrap
                            overflow="visible"
                            id={`${i}-length-typography`}
                            fontFamily={fontFamily}
                        >
                            arm {i + 1}:
                        </Typography>
                        <Box
                            key={`${i}`}
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-evenly",
                                // gap: 2,
                                width: 1,
                            }}
                        >
                            <Typography
                                noWrap
                                overflow="visible"
                                id={`${i}-length-typography`}
                                fontFamily={fontFamily}
                            >
                                length: {data.length}
                            </Typography>
                            <Slider
                                value={data.length}
                                onChange={(
                                    _: Event,
                                    newValue: number | number[],
                                ) => {
                                    const newArmData = [...armData];
                                    newArmData[i] = {
                                        ...armData[i],
                                        length: newValue as number,
                                    };
                                    setArmData(newArmData);
                                }}
                                min={10}
                                max={100}
                                step={1}
                                valueLabelDisplay="auto"
                                aria-labelledby={`${i}-length-typography`}
                            />
                            <Typography
                                noWrap
                                overflow="visible"
                                id={`${i}-mass-typography`}
                                fontFamily={fontFamily}
                            >
                                mass: {data.mass}
                            </Typography>
                            <Slider
                                value={data.mass}
                                onChange={(
                                    _: Event,
                                    newValue: number | number[],
                                ) => {
                                    const newArmData = [...armData];
                                    newArmData[i] = {
                                        ...armData[i],
                                        mass: newValue as number,
                                    };
                                    setArmData(newArmData);
                                }}
                                min={1}
                                max={100}
                                step={1}
                                valueLabelDisplay="auto"
                                aria-labelledby={`${i}-mass-typography`}
                            />
                            <Typography
                                noWrap
                                overflow="visible"
                                id={`${i}-angle-typography`}
                                fontFamily={fontFamily}
                            >
                                initial angle: {data.initialAngle}
                            </Typography>
                            <Slider
                                value={data.initialAngle}
                                onChange={(
                                    _: Event,
                                    newValue: number | number[],
                                ) => {
                                    const newArmData = [...armData];
                                    newArmData[i] = {
                                        ...armData[i],
                                        initialAngle: newValue as number,
                                    };
                                    setArmData(newArmData);
                                }}
                                min={0}
                                max={360}
                                step={1}
                                valueLabelDisplay="auto"
                                aria-labelledby={`${i}-angle-typography`}
                            />
                        </Box>
                    </Box>
                ))}
                <Button
                    variant="outlined"
                    onClick={handleResetPendulum}
                    sx={{
                        fontFamily: fontFamily,
                    }}
                >
                    apply settings
                </Button>
            </Box>
        </>
    );
};

export default PendulumComponent;
