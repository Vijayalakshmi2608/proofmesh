import { createRoot } from "react-dom/client";
import App from "./App";
import { SolanaProvider } from "./contexts/SolanaProvider";
import { AppModeProvider } from "./contexts/AppModeContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(<AppModeProvider><SolanaProvider><App /></SolanaProvider></AppModeProvider>);
