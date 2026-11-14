import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";
import "./index.css";

// Apply saved theme on load
const saved = localStorage.getItem("squash-theme");
if (saved === "light") {
  document.documentElement.classList.add("light");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
