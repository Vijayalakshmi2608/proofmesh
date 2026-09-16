import { createRoot } from "react-dom/client";
import App from "./App";
import { SolanaProvider } from "./contexts/SolanaProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(<SolanaProvider><App /></SolanaProvider>);
