import { Helmet } from "react-helmet-async";

import Router from "Router";

const App = () => {
    return (
        <>
            <Helmet>
                <title>{"> paul wrubel"}</title>
            </Helmet>
            <Router />
        </>
    );
};

export default App;
