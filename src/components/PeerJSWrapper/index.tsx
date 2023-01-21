import { useEffect, useState } from "react";

import { Box, Button, Typography } from "@mui/material";

import { Peer } from "peerjs";

import { randomCherryPickFromArray } from "utils";

import { alphabet, fontFamilyString, peerPrefix } from "./common";
import HostWrapper from "./HostWrapper";
import PeerWrapper from "./PeerWrapper";
import { ConnectionInfo, PeerJSWrapperChild } from "./types";

type PeerJSWrapperProps = {
    minPeers: number;
    maxPeers: number;
    children: PeerJSWrapperChild;
};

const PeerJSWrapper = ({
    children,
    minPeers,
    maxPeers,
}: PeerJSWrapperProps) => {
    const [peer, setPeer] = useState<Peer>();
    const [role, setRole] = useState<ConnectionInfo["role"]>();

    useEffect(() => {
        if (!peer) {
            const id =
                peerPrefix +
                randomCherryPickFromArray([...alphabet], 4).join("");
            const peer = new Peer(id);
            setPeer(peer);
        }
    }, []);

    if (!peer) {
        return (
            <Typography align="center" sx={{ fontFamily: fontFamilyString }}>
                unknown issue creating peer instance!
            </Typography>
        );
    }

    switch (role) {
        case undefined: {
            return (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        p: 1,
                        gap: 1,
                    }}
                >
                    <Button
                        size="large"
                        variant="contained"
                        onClick={() => {
                            setRole("host");
                        }}
                        sx={{
                            fontFamily: fontFamilyString,
                        }}
                    >
                        host game
                    </Button>
                    <Button
                        size="large"
                        variant="contained"
                        onClick={() => {
                            setRole("peer");
                        }}
                        sx={{
                            fontFamily: fontFamilyString,
                        }}
                    >
                        connect to a game
                    </Button>
                </Box>
            );
        }
        case "host": {
            return (
                <HostWrapper
                    peer={peer}
                    minPeers={minPeers}
                    maxPeers={maxPeers}
                >
                    {children}
                </HostWrapper>
            );
        }
        case "peer": {
            return <PeerWrapper peer={peer}>{children}</PeerWrapper>;
        }
    }
};

export { PeerJSWrapper };
