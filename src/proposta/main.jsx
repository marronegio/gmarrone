import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { startScroll } from "../lib/scroll.js";
import "./proposta.css";

startScroll();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
