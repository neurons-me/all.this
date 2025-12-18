// init/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { GuiProvider } from "this.gui";
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <GuiProvider>
        <App />
    </GuiProvider>
  </React.StrictMode>
);