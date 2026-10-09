import React from "react";
import {createRoot} from "react-dom/client";
import Archive from "./app/archive-client";
import "./app/globals.css";
createRoot(document.getElementById("root")!).render(<React.StrictMode><Archive/></React.StrictMode>);
