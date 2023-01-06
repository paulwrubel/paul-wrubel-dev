import { Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";

import Home from "views/Home";
import NotFound from "views/NotFound";

const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route index element={<Home />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
};

export default Router;
