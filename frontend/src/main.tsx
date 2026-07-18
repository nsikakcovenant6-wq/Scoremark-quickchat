import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
// react-hot-toast may not be installed in some environments; load at runtime to avoid TS error
// @ts-ignore
const { Toaster } = require("react-hot-toast") || { Toaster: (props: any) => null };

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
        <Toaster position="top-right" />
    </React.StrictMode>
);