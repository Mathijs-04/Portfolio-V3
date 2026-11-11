import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import "./styles/base.css";
import "./styles/atmosphere.css";
import "./styles/button.css";
import "./styles/home.css";
import "./styles/card.css";
import "./styles/projects.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <MotionConfig reducedMotion="user">
            <App />
        </MotionConfig>
    </StrictMode>,
);
