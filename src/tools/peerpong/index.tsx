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
