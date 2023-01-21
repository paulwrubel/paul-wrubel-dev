import { DataConnection } from "peerjs";

type HostInfo = {
    role: "host";
    peers: DataConnection[];
};

type PeerInfo = {
    role: "peer";
    host?: DataConnection;
};

type ConnectionInfo = PeerInfo | HostInfo;

type ConnectionState =
    | "pending"
    | "connecting"
    | "connected"
    | "ingame"
    | "error";

type PeerConnectionState = ConnectionState;
type HostConnectionState = Exclude<ConnectionState, "connecting">;

type DataMessage = {
    type: string;
    payload?: unknown;
};

const isDataMessage = (data: unknown): data is DataMessage => {
    return (
        (data as DataMessage).type !== undefined &&
        (data as DataMessage).payload !== undefined
    );
};

type LobbyInfo = {
    isGameStarted: boolean;
    hostID?: string;
    peerIDs: string[];
};

type ChildFunctionParameters = {
    connectionInfo: ConnectionInfo;
};

type PeerJSWrapperChild = (
    params: ChildFunctionParameters,
) => React.ReactElement;

export type {
    HostInfo,
    PeerInfo,
    ConnectionInfo,
    ConnectionState,
    HostConnectionState,
    PeerConnectionState,
    DataMessage,
    LobbyInfo,
    ChildFunctionParameters,
    PeerJSWrapperChild,
};
export { isDataMessage };
