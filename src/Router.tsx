import { useState } from "react";

import { Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";

import Root from "Root";
import About from "views/About";
import Home from "views/Home";
import NotFound from "views/NotFound";
import Projects from "views/Projects";
import Tool from "views/Tool";
import Tools from "views/Tools";
import ToolsIndex from "views/ToolsIndex";

const Router = () => {
    const [finishedHomeAnim, setFinishedHomeAnim] = useState(false);
    const [finishedProjectsAnim, setFinishedProjectsAnim] = useState(false);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Root />}>
                    <Route
                        index
                        element={
                            <Home
                                finishedAnim={finishedHomeAnim}
                                setFinishedAnim={setFinishedHomeAnim}
                            />
                        }
                    />
                    <Route path="/about" element={<About />} />
                    <Route
                        path="/projects"
                        element={
                            <Projects
                                finishedAnim={finishedProjectsAnim}
                                setFinishedAnim={setFinishedProjectsAnim}
                            />
                        }
                    />
                    <Route path="/tools" element={<Tools />}>
                        <Route index element={<ToolsIndex />} />
                        <Route path=":tool" element={<Tool />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default Router;
