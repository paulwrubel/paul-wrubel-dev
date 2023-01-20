import { DataConnection } from "peerjs";

type PeerRole = "host" | "peer";

type ConnectionInfo = {
    role: PeerRole;
    connection: DataConnection;
};

type ConnectionState =
    | "host_pending"
    | "host_connected"
    | "peer_pending"
    | "peer_connected"
    | "peer_connecting"
    | "unknown"
    | "error";

export type { PeerRole, ConnectionInfo, ConnectionState };
