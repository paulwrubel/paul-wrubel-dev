import { useEffect, useState } from "react";

import { Box, Button, TextField, Typography } from "@mui/material";

import { DataConnection, Peer } from "peerjs";

import { randomCherryPickFromArray } from "utils";

type HostInfo = {
    role: "host";
    peers: DataConnection[];
};

type PeerInfo = {
    role: "peer";
    host: DataConnection;
};

type ConnectionInfo = HostInfo | PeerInfo;

type ConnectionState =
    | "host_pending"
    | "host_connected"
    | "host_ingame"
    | "peer_pending"
    | "peer_connected"
    | "peer_connecting"
    | "peer_ingame"
    | "unknown"
    | "error";

// type WrapperMessageType = "peerjswrapper_lobby-info";

type DataMessage = {
    type: string;
    payload?: unknown;
};

type LobbyInfo = {
    isGameStarted: boolean;
    hostID?: string;
    peerIDs: string[];
};

type ChildFunctionParameters = {
    connectionInfo: ConnectionInfo;
};

type PeerJSWrapperProps = {
    minPeers: number;
    maxPeers: number;
    children: (params: ChildFunctionParameters) => React.ReactElement;
};

const PeerJSWrapper = ({
    minPeers,
    maxPeers,
    children,
}: PeerJSWrapperProps) => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const peerPrefix = "paulwrubel-dev-peerpong-";

    const lobbyInfoMessageType = "peerjswrapper_lobby-info";

    const fontString = '"Source Code Pro", monospace';

    const [peer, setPeer] = useState<Peer>();
    const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>();
    const [connectionState, setConnectionState] =
        useState<ConnectionState>("unknown");
    const [error, setError] = useState<Error>();
    const [lobbyInfo, setLobbyInfo] = useState<LobbyInfo>({
        isGameStarted: false,
        peerIDs: [],
    });

    const [enteredHostID, setEnteredHostID] = useState<string>("");

    const isHostIDValid = (id: string) => {
        return (
            id.length === 4 &&
            [...id].every((letter) => alphabet.includes(letter))
        );
    };

    const onError = (err: Error) => {
        setError(err);
        setConnectionState("error");
    };

    const sendNewLobbyInfo = (
        newLobbyInfo: LobbyInfo,
        updatedConnectionInfo?: ConnectionInfo,
    ) => {
        const dataMessage: DataMessage = {
            type: lobbyInfoMessageType,
            payload: newLobbyInfo,
        };
        setLobbyInfo(newLobbyInfo);
        const connInfo = updatedConnectionInfo ?? connectionInfo ?? undefined;
        if (!connInfo) {
            throw new Error("no connection info to new new Lobby Info from");
        }
        (connInfo as HostInfo).peers.forEach((peerConn) => {
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
            setConnectionInfo((connectionInfo) => {
                const newPeerConns = connectionInfo
                    ? [...(connectionInfo as HostInfo).peers, conn]
                    : [conn];
                if (lobbyInfo.isGameStarted || newPeerConns.length > maxPeers) {
                    conn.close();
                    return connectionInfo;
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
            setConnectionState("host_connected");
        });
    };

    const isDataMessage = (data: unknown): data is DataMessage => {
        return (
            (data as DataMessage).type !== undefined &&
            (data as DataMessage).payload !== undefined
        );
    };

    const onDataFromHost = (data: unknown) => {
        if (isDataMessage(data) && data.type === lobbyInfoMessageType) {
            const payload = data.payload as LobbyInfo;
            setLobbyInfo(payload);
            if (payload.isGameStarted) {
                setConnectionState("peer_ingame");
            }
        }
    };

    const getOnPeerConnectionToHostOpenFunction =
        (conn: DataConnection) => () => {
            setConnectionInfo({
                role: "peer",
                host: conn,
            });
            setConnectionState("peer_connected");
            conn.on("data", onDataFromHost);
        };

    const onPeerConnectionToHostClosed = () => {
        onError(new Error("connection closed by host. Is the lobby full?"));
    };

    useEffect(() => {
        if (!peer) {
            console.log("setting peer");
            const id =
                peerPrefix +
                randomCherryPickFromArray([...alphabet], 4).join("");
            console.log("peer id: ", id);
            const peer = new Peer(id);
            peer.on("error", onError);
            setPeer(peer);
        }
    }, []);

    if (!peer) {
        return <p>unknown issue creating peer instance!</p>;
    }

    switch (connectionState) {
        case "unknown": {
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
                            setConnectionState("host_pending");
                            peer.on("connection", onHostReceivesConnection);
                        }}
                        sx={{
                            fontFamily: fontString,
                        }}
                    >
                        host game
                    </Button>
                    <Button
                        size="large"
                        variant="contained"
                        onClick={() => {
                            setConnectionState("peer_pending");
                        }}
                        sx={{
                            fontFamily: fontString,
                        }}
                    >
                        connect to a game
                    </Button>
                </Box>
            );
        }
        case "host_pending": {
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
                        sx={{ fontFamily: fontString }}
                    >
                        use this code to connect an opponent
                    </Typography>
                    <Typography
                        fontSize="6rem"
                        align="center"
                        sx={{ letterSpacing: "2rem", fontFamily: fontString }}
                    >
                        {peer.id.replace(peerPrefix, "")}
                    </Typography>
                </Box>
            );
        }
        case "peer_pending": {
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
                        fontSize="1.3rem"
                        align="center"
                        sx={{ fontFamily: fontString }}
                    >
                        {"enter a host's 4 letter code below to connect"}
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <TextField
                            value={enteredHostID}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>,
                            ) => {
                                const newValue =
                                    event.target.value.toUpperCase();
                                if (
                                    newValue.length <= 4 &&
                                    [...newValue].every((letter) =>
                                        alphabet.includes(letter),
                                    )
                                ) {
                                    setEnteredHostID(newValue);
                                }
                            }}
                            error={!isHostIDValid(enteredHostID)}
                            id="host-code"
                            label="four letter code"
                            InputProps={{ sx: { fontFamily: fontString } }}
                            InputLabelProps={{ sx: { fontFamily: fontString } }}
                            variant="outlined"
                        />
                        <Button
                            disabled={!isHostIDValid(enteredHostID)}
                            size="large"
                            variant="contained"
                            onClick={() => {
                                const conn = peer.connect(
                                    `${peerPrefix}${enteredHostID}`,
                                );
                                conn.on("error", onError);
                                conn.on(
                                    "open",
                                    getOnPeerConnectionToHostOpenFunction(conn),
                                );
                                conn.on("close", onPeerConnectionToHostClosed);
                                setConnectionState("peer_connecting");
                            }}
                            sx={{ fontFamily: fontString }}
                        >
                            connect
                        </Button>
                    </Box>
                </Box>
            );
        }
        case "peer_connecting": {
            return (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        p: 1,
                        gap: 10,
                    }}
                >
                    <Typography align="center" sx={{ fontFamily: fontString }}>
                        attempting to open a connection to {enteredHostID}...
                    </Typography>
                    <Typography align="center" sx={{ fontFamily: fontString }}>
                        please be patient
                    </Typography>
                </Box>
            );
        }
        case "host_connected": {
            if (!connectionInfo || connectionInfo.role !== "host") {
                return (
                    <Typography align="center" sx={{ fontFamily: fontString }}>
                        {`Error: connection is undefined, but state is "${connectionState}"`}
                    </Typography>
                );
            }
            return (
                <>
                    <Typography
                        align="center"
                        sx={{ fontFamily: fontString }}
                    >{`Host: ${
                        lobbyInfo.hostID?.replace(peerPrefix, "") ?? "huh?"
                    } (you)`}</Typography>
                    <Typography
                        align="center"
                        sx={{ fontFamily: fontString }}
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
                            setConnectionState("host_ingame");
                            // connectionInfo.peers.forEach((peerConn) => {
                            //     peerConn.send(dataMessage);
                            // });
                        }}
                        sx={{ fontFamily: fontString }}
                    >
                        start game
                    </Button>
                </>
            );
        }
        case "peer_connected": {
            if (!connectionInfo || connectionInfo.role !== "peer") {
                return (
                    <Typography align="center" sx={{ fontFamily: fontString }}>
                        {`Error: connection is undefined, but state is "${connectionState}"`}
                    </Typography>
                );
            }
            return (
                <>
                    <Typography
                        align="center"
                        sx={{ fontFamily: fontString }}
                    >{`Host: ${connectionInfo.host.peer.replace(
                        peerPrefix,
                        "",
                    )}`}</Typography>
                    <Typography
                        align="center"
                        sx={{ fontFamily: fontString }}
                    >{`Peers: ${lobbyInfo.peerIDs.map(
                        (id) =>
                            id.replace(peerPrefix, "") +
                            (id === peer.id ? " (you)" : ""),
                    )}`}</Typography>
                </>
            );
        }

        case "host_ingame": {
            if (!connectionInfo || connectionInfo.role !== "host") {
                return (
                    <Typography align="center" sx={{ fontFamily: fontString }}>
                        {`Error: connection is undefined, but state is "${connectionState}"`}
                    </Typography>
                );
            }
            return children({
                connectionInfo: connectionInfo,
            });
        }
        case "peer_ingame": {
            if (!connectionInfo || connectionInfo.role !== "peer") {
                return (
                    <Typography align="center" sx={{ fontFamily: fontString }}>
                        {`Error: connection is undefined, but state is "${connectionState}"`}
                    </Typography>
                );
            }
            return children({
                connectionInfo: connectionInfo,
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
                    <Typography align="center" sx={{ fontFamily: fontString }}>
                        the following error occured:
                    </Typography>
                    <Typography
                        fontWeight="bold"
                        align="center"
                        sx={{ fontFamily: fontString }}
                    >
                        {`"${error as Error}"`}
                    </Typography>
                    <Typography align="center" sx={{ fontFamily: fontString }}>
                        please refresh the page and try again
                    </Typography>
                </Box>
            );
        }
    }
};

export type {
    ConnectionInfo,
    HostInfo,
    PeerInfo,
    DataConnection,
    ConnectionState,
};
export { PeerJSWrapper };
