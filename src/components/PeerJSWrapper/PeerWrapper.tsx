import { useEffect, useState } from "react";

import { Box, Button, TextField, Typography } from "@mui/material";

import { DataConnection, Peer } from "peerjs";

import {
    alphabet,
    fontFamilyString,
    lobbyInfoMessageType,
    peerPrefix,
} from "./common";
import {
    LobbyInfo,
    PeerConnectionState,
    PeerInfo,
    PeerJSWrapperChild,
    isDataMessage,
} from "./types";

type PeerWrapperProps = {
    children: PeerJSWrapperChild;

    peer: Peer;
};

const PeerWrapper = ({ children, peer }: PeerWrapperProps) => {
    const [connectionState, setConnectionState] =
        useState<PeerConnectionState>("pending");
    const [peerInfo, setPeerInfo] = useState<PeerInfo>({
        role: "peer",
    });
    const [lobbyInfo, setLobbyInfo] = useState<LobbyInfo>({
        isGameStarted: false,
        peerIDs: [],
    });

    const [error, setError] = useState<Error>();

    const [enteredHostID, setEnteredHostID] = useState<string>("");

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

    const isHostIDValid = (id: string) => {
        return (
            id.length === 4 &&
            [...id].every((letter) => alphabet.includes(letter))
        );
    };

    const onDataFromHost = (data: unknown) => {
        if (isDataMessage(data) && data.type === lobbyInfoMessageType) {
            const payload = data.payload as LobbyInfo;
            setLobbyInfo(payload);
            if (payload.isGameStarted) {
                setConnectionState("ingame");
            }
        }
    };

    const getOnPeerConnectionToHostOpenFunction =
        (conn: DataConnection) => () => {
            setPeerInfo({
                ...peerInfo,
                host: conn,
            });
            setConnectionState("connected");
            conn.on("data", onDataFromHost);
        };

    const onPeerConnectionToHostClosed = () => {
        onError(new Error("connection closed by host. Is the lobby full?"));
    };

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
                        fontSize="1.3rem"
                        align="center"
                        sx={{ fontFamily: fontFamilyString }}
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
                            InputProps={{
                                sx: { fontFamily: fontFamilyString },
                            }}
                            InputLabelProps={{
                                sx: { fontFamily: fontFamilyString },
                            }}
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
                                setConnectionState("connecting");
                            }}
                            sx={{ fontFamily: fontFamilyString }}
                        >
                            connect
                        </Button>
                    </Box>
                </Box>
            );
        }
        case "connecting": {
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
                        attempting to open a connection to {enteredHostID}...
                    </Typography>
                    <Typography
                        align="center"
                        sx={{ fontFamily: fontFamilyString }}
                    >
                        please be patient
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
                    >{`Host: ${peerInfo.host?.peer.replace(
                        peerPrefix,
                        "",
                    )}`}</Typography>
                    <Typography
                        align="center"
                        sx={{ fontFamily: fontFamilyString }}
                    >{`Peers: ${lobbyInfo.peerIDs.map(
                        (id) =>
                            id.replace(peerPrefix, "") +
                            (id === peer.id ? " (you)" : ""),
                    )}`}</Typography>
                </>
            );
        }
        case "ingame": {
            return children({
                connectionInfo: peerInfo,
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

export default PeerWrapper;
