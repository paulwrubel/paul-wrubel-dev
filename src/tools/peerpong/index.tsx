// import { useEffect, useState } from "react";

// import { Box, Button, TextField, Typography } from "@mui/material";

// import { DataConnection, Peer } from "peerjs";

// import { randomCherryPickFromArray } from "utils";

// import PeerPongSketch from "./PeerPongSketch";
// import { ConnectionInfo, ConnectionState } from "./types";

import { PeerJSWrapper } from "components/peerjs/PeerJSWrapper";

import PeerPongSketch from "./PeerPongSketch";

const PeerPong = () => {
    return (
        <PeerJSWrapper minPeers={1} maxPeers={1}>
            {({ connectionInfo }) => (
                <PeerPongSketch connectionInfo={connectionInfo} />
            )}
        </PeerJSWrapper>
    );
    // const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    // const peerPrefix = "paulwrubel-dev-peerpong-";

    // const fontString = '"Source Code Pro", monospace';

    // const [peer, setPeer] = useState<Peer>();
    // const [connection, setConnection] = useState<DataConnection>();
    // const [error, setError] = useState<Error>();

    // const [enteredHostID, setEnteredHostID] = useState<string>("");
    // // const [dataToSend, setDataToSend] = useState<string>("");
    // // const [receivedData, setReceivedData] = useState<unknown>("");

    // // console.log(`RERENDERED! new received data is "${receivedData}"`);

    // const [connectionState, setConnectionState] =
    //     useState<ConnectionState>("unknown");

    // const isHostIDValid = (id: string) => {
    //     return (
    //         id.length === 4 &&
    //         [...id].every((letter) => alphabet.includes(letter))
    //     );
    // };

    // const onError = (err: Error) => {
    //     setError(err);
    //     setConnectionState("error");
    // };

    // const onHostReceivesConnection: (conn: DataConnection) => void = (
    //     conn: DataConnection,
    // ): void => {
    //     console.log("just had a peer connect to me!");
    //     console.log(`peer id: ${conn.peer}`);
    //     conn.on("error", onError);
    //     conn.on("open", () => {
    //         setConnection(conn);
    //         setConnectionState("host_connected");
    //     });
    // };

    // useEffect(() => {
    //     if (!peer) {
    //         console.log("setting peer");
    //         const id =
    //             peerPrefix +
    //             randomCherryPickFromArray([...alphabet], 4).join("");
    //         console.log("peer id: ", id);
    //         const peer = new Peer(id);
    //         peer.on("error", onError);
    //         setPeer(peer);
    //     }
    // }, []);

    // if (!peer) {
    //     return <p>unknown issue creating peer instance!</p>;
    // }

    // switch (connectionState) {
    //     case "unknown": {
    //         return (
    //             <Box
    //                 sx={{
    //                     display: "flex",
    //                     flexDirection: "column",
    //                     p: 1,
    //                     gap: 1,
    //                 }}
    //             >
    //                 <Button
    //                     size="large"
    //                     variant="contained"
    //                     onClick={() => {
    //                         setConnectionState("host_pending");
    //                         peer.on("connection", onHostReceivesConnection);
    //                     }}
    //                     sx={{
    //                         fontFamily: fontString,
    //                     }}
    //                 >
    //                     host game
    //                 </Button>
    //                 <Button
    //                     size="large"
    //                     variant="contained"
    //                     onClick={() => {
    //                         setConnectionState("peer_pending");
    //                     }}
    //                     sx={{
    //                         fontFamily: fontString,
    //                     }}
    //                 >
    //                     connect to a game
    //                 </Button>
    //             </Box>
    //         );
    //     }
    //     case "host_pending": {
    //         return (
    //             <Box
    //                 sx={{
    //                     display: "flex",
    //                     flexDirection: "column",
    //                     p: 1,
    //                     gap: 1,
    //                 }}
    //             >
    //                 <Typography
    //                     fontSize="2rem"
    //                     align="center"
    //                     sx={{ fontFamily: fontString }}
    //                 >
    //                     use this code to connect an opponent
    //                 </Typography>
    //                 <Typography
    //                     fontSize="6rem"
    //                     align="center"
    //                     sx={{ letterSpacing: "2rem", fontFamily: fontString }}
    //                 >
    //                     {peer.id.replace(peerPrefix, "")}
    //                 </Typography>
    //             </Box>
    //         );
    //     }
    //     case "peer_pending": {
    //         return (
    //             <Box
    //                 sx={{
    //                     display: "flex",
    //                     flexDirection: "column",
    //                     p: 1,
    //                     gap: 1,
    //                 }}
    //             >
    //                 <Typography
    //                     fontSize="1.3rem"
    //                     align="center"
    //                     sx={{ fontFamily: fontString }}
    //                 >
    //                     {"enter a host's 4 letter code below to connect"}
    //                 </Typography>
    //                 <Box
    //                     sx={{
    //                         display: "flex",
    //                         justifyContent: "space-between",
    //                     }}
    //                 >
    //                     <TextField
    //                         value={enteredHostID}
    //                         onChange={(
    //                             event: React.ChangeEvent<HTMLInputElement>,
    //                         ) => {
    //                             const newValue =
    //                                 event.target.value.toUpperCase();
    //                             if (
    //                                 newValue.length <= 4 &&
    //                                 [...newValue].every((letter) =>
    //                                     alphabet.includes(letter),
    //                                 )
    //                             ) {
    //                                 setEnteredHostID(newValue);
    //                             }
    //                         }}
    //                         error={!isHostIDValid(enteredHostID)}
    //                         id="host-code"
    //                         label="four letter code"
    //                         InputProps={{ sx: { fontFamily: fontString } }}
    //                         InputLabelProps={{ sx: { fontFamily: fontString } }}
    //                         variant="outlined"
    //                     />
    //                     <Button
    //                         disabled={!isHostIDValid(enteredHostID)}
    //                         size="large"
    //                         variant="contained"
    //                         onClick={() => {
    //                             const conn = peer.connect(
    //                                 `${peerPrefix}${enteredHostID}`,
    //                             );
    //                             conn.on("error", onError);
    //                             conn.on("open", () => {
    //                                 setConnection(conn);
    //                                 setConnectionState("peer_connected");
    //                             });
    //                             setConnectionState("peer_connecting");
    //                         }}
    //                         sx={{ fontFamily: fontString }}
    //                     >
    //                         connect
    //                     </Button>
    //                 </Box>
    //             </Box>
    //         );
    //     }
    //     case "peer_connecting": {
    //         return (
    //             <Box
    //                 sx={{
    //                     display: "flex",
    //                     flexDirection: "column",
    //                     p: 1,
    //                     gap: 10,
    //                 }}
    //             >
    //                 <Typography align="center" sx={{ fontFamily: fontString }}>
    //                     attempting to open a connection to {enteredHostID}...
    //                 </Typography>
    //                 <Typography align="center" sx={{ fontFamily: fontString }}>
    //                     please be patient
    //                 </Typography>
    //             </Box>
    //         );
    //     }
    //     case "host_connected": {
    //         const connectionInfo: ConnectionInfo = {
    //             role: "host",
    //             connection: connection as DataConnection,
    //         };
    //         return <PeerPongSketch connectionInfo={connectionInfo} />;
    //     }
    //     case "peer_connected": {
    //         const connectionInfo: ConnectionInfo = {
    //             role: "peer",
    //             connection: connection as DataConnection,
    //         };
    //         return <PeerPongSketch connectionInfo={connectionInfo} />;
    //     }
    //     case "error": {
    //         return (
    //             <Box
    //                 sx={{
    //                     display: "flex",
    //                     flexDirection: "column",
    //                     p: 1,
    //                     gap: 10,
    //                 }}
    //             >
    //                 <Typography align="center" sx={{ fontFamily: fontString }}>
    //                     the following error occured:
    //                 </Typography>
    //                 <Typography
    //                     fontWeight="bold"
    //                     align="center"
    //                     sx={{ fontFamily: fontString }}
    //                 >
    //                     {`"${error as Error}"`}
    //                 </Typography>
    //                 <Typography align="center" sx={{ fontFamily: fontString }}>
    //                     please refresh the page and try again
    //                 </Typography>
    //             </Box>
    //         );
    //     }
    // }
};

export default PeerPong;
