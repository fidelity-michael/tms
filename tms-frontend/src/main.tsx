import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { CustomProvider } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { ThemeProvider } from "@material-tailwind/react";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <CustomProvider theme="light">
        <App />
      </CustomProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
