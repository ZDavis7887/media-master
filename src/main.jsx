import React from "react";
import ReactDOM from "react-dom/client";
import RandomPicker from "./RandomPicker";
import './index.css'  // ← THIS IS IMPORTANT

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RandomPicker />
  </React.StrictMode>
);
