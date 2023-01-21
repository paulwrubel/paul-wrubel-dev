// import { useEffect, useState } from "react";

// import { Box, Button, TextField, Typography } from "@mui/material";

// import { DataConnection, Peer } from "peerjs";

// import { randomCherryPickFromArray } from "utils";

// import PeerPongSketch from "./PeerPongSketch";
// import { ConnectionInfo, ConnectionState } from "./types";

import { PeerJSWrapper } from "components/PeerJSWrapper";

import PeerPongSketch from "./PeerPongSketch";

const PeerPong = () => {
    return (
        <PeerJSWrapper minPeers={1} maxPeers={1}>
            {({ connectionInfo }) => (
                <PeerPongSketch connectionInfo={connectionInfo} />
            )}
        </PeerJSWrapper>
    );
};

export default PeerPong;
