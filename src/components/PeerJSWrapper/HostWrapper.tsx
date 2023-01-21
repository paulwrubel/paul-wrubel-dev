import { useEffect, useState } from "react";

import { Box, Button, Typography } from "@mui/material";

import { DataConnection, Peer } from "peerjs";

import { fontFamilyString, lobbyInfoMessageType, peerPrefix } from "./common";
import {
    DataMessage,
    HostConnectionState,
    HostInfo,
    LobbyInfo,
    PeerJSWrapperChild,
} from "./types";

type HostWrapperProps = {
    children: PeerJSWrapperChild;

    peer: Peer;
    minPeers: number;
    maxPeers: number;
};

const HostWrapper = ({
    children,
    peer,
    minPeers,
    maxPeers,
}: HostWrapperProps) => {
    const [connectionState, setConnectionState] =
        useState<HostConnectionState>("pending");
    const [hostInfo, setHostInfo] = useState<HostInfo>({
        role: "host",
        peers: [],
    });
    const [lobbyInfo, setLobbyInfo] = useState<LobbyInfo>({
        isGameStarted: false,
        peerIDs: [],
    });

    const [error, setError] = useState<Error>();

    const onError = (err: Error) => {
        setError(err);
        setConnectionState("error");
    };

    useEffect(() => {
        peer.on("error", onError);
        return () => {
            peer.removeListener("error", onError);
        };
    }, [peer]);

    const sendNewLobbyInfo = (
        newLobbyInfo: LobbyInfo,
        updatedHostInfo?: HostInfo,
    ) => {
        const dataMessage: DataMessage = {
            type: lobbyInfoMessageType,
            payload: newLobbyInfo,
        };
        setLobbyInfo(newLobbyInfo);
        const trueHostInfo = updatedHostInfo ?? hostInfo;
        trueHostInfo.peers.forEach((peerConn) => {
            peerConn.send(dataMessage);
        });
    };

    const onHostReceivesConnection: (conn: DataConnection) => void = (
        conn,
    ): void => {
        console.log("just had a peer connect to me!");
        console.log(`peer id: ${conn.peer}`);
        conn.on("error", onError);
        conn.on("open", () => {
            setHostInfo((hostInfo) => {
                const newPeerConns = [...hostInfo.peers, conn];
                if (lobbyInfo.isGameStarted || newPeerConns.length > maxPeers) {
                    conn.close();
                    return hostInfo;
                }
                const newLobbyInfo: LobbyInfo = {
                    isGameStarted: false,
                    hostID: (peer as Peer).id,
                    peerIDs: newPeerConns.map((peerConn) => peerConn.peer),
                };
                const updatedHostInfo: HostInfo = {
                    role: "host",
                    peers: newPeerConns,
                };
                sendNewLobbyInfo(newLobbyInfo, updatedHostInfo);
                // const dataMessage: DataMessage = {
                //     type: "peerjswrapper_lobby-info",
                //     payload: newLobbyInfo,
                // };
                // setLobbyInfo(newLobbyInfo);
                // newPeerConns.forEach((peerConn) => {
                //     peerConn.send(dataMessage);
                // });
                return updatedHostInfo;
            });
            setConnectionState("connected");
        });
    };

    useEffect(() => {
        peer.on("connection", onHostReceivesConnection);
        return () => {
            peer.removeListener("connection", onHostReceivesConnection);
        };
    });

    switch (connectionState) {
        case "pending": {
            return (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        p: 1,
                        gap: 1,
                    }}
                >
                    <Typography
                        fontSize="2rem"
                        align="center"
                        sx={{ fontFamily: fontFamilyString }}
                    >
                        use this code to connect an opponent
                    </Typography>
                    <Typography
                        fontSize="6rem"
                        align="center"
                        sx={{
                            letterSpacing: "2rem",
                            fontFamily: fontFamilyString,
                        }}
                    >
                        {peer.id.replace(peerPrefix, "")}
                    </Typography>
                </Box>
            );
        }
        case "connected": {
            return (
                <>
                    <Typography
                        align="center"
                        sx={{ fontFamily: fontFamilyString }}
                    >{`Host: ${
                        lobbyInfo.hostID?.replace(peerPrefix, "") ?? "huh?"
                    } (you)`}</Typography>
                    <Typography
                        align="center"
                        sx={{ fontFamily: fontFamilyString }}
                    >{`Peers: ${lobbyInfo.peerIDs.map((id) =>
                        id.replace(peerPrefix, ""),
                    )}`}</Typography>
                    <Button
                        disabled={lobbyInfo.peerIDs.length < minPeers}
                        size="large"
                        variant="contained"
                        onClick={() => {
                            const newLobbyInfo: LobbyInfo = {
                                ...lobbyInfo,
                                isGameStarted: true,
                            };
                            sendNewLobbyInfo(newLobbyInfo);
                            // const dataMessage: DataMessage = {
                            //     type: "peerjswrapper_lobby-info",
                            //     payload: newLobbyInfo,
                            // };
                            // setLobbyInfo(newLobbyInfo);
                            setConnectionState("ingame");
                            // connectionInfo.peers.forEach((peerConn) => {
                            //     peerConn.send(dataMessage);
                            // });
                        }}
                        sx={{ fontFamily: fontFamilyString }}
                    >
                        start game
                    </Button>
                </>
            );
        }
        case "ingame": {
            return children({
                connectionInfo: hostInfo,
            });
        }
        case "error": {
            return (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        p: 1,
                        gap: 10,
                    }}
                >
                    <Typography
                        align="center"
                        sx={{ fontFamily: fontFamilyString }}
                    >
                        the following error occured:
                    </Typography>
                    <Typography
                        fontWeight="bold"
                        align="center"
                        sx={{ fontFamily: fontFamilyString }}
                    >
                        {`"${error as Error}"`}
                    </Typography>
                    <Typography
                        align="center"
                        sx={{ fontFamily: fontFamilyString }}
                    >
                        please refresh the page and try again
                    </Typography>
                </Box>
            );
        }
    }

    return <p>hi</p>;
};

export default HostWrapper;
