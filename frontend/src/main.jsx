import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router";
import { ThemeProvider } from "./context/ThemeContext";
import { GamificationProvider } from "./context/GamificationContext";
import { OnlineStatusProvider } from "./context/OnlineStatusContext";
import "./styles/globals.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <OnlineStatusProvider>
          <GamificationProvider>
            <AppRouter />
          </GamificationProvider>
        </OnlineStatusProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
