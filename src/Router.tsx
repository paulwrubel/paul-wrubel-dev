import { Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";

import Root from "Root";
import About from "views/About";
import Home from "views/Home";
import NotFound from "views/NotFound";
import Projects from "views/Projects";
import Tools from "views/Tools";

const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Root />}>
                    <Route index element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/tools" element={<Tools />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default Router;
