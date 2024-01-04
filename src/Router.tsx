import { useState } from "react";

import { Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";

import Root from "Root";
import About from "views/About";
import Genuary from "views/Genuary";
import Home from "views/Home";
import NotFound from "views/NotFound";
import Projects from "views/Projects";
import Tool from "views/Tool";
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
                    <Route path="/genuary" element={<Genuary />} />
                    <Route path="/tools" element={<ToolsIndex />} />
                    <Route path="/tools/:tool" element={<Tool />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default Router;
