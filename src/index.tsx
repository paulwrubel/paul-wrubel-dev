import React from "react";

import "index.css";
import { CssBaseline, ThemeProvider } from "@mui/material";

import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";

import reportWebVitals from "misc/reportWebVitals";
import Theme from "Theme";

import App from "./App";

createRoot(document.getElementById("root") as HTMLElement).render(
    // <React.StrictMode>
    <ThemeProvider theme={Theme}>
        <HelmetProvider>
            <CssBaseline />
            <App />
        </HelmetProvider>
    </ThemeProvider>,
    // {/* </React.StrictMode>, */}
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
