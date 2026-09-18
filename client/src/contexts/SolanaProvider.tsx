import { clusterApiUrl } from "@solana/web3.js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { useMemo, type ReactNode } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";

export const SOLANA_NETWORK = "devnet" as const;
export const DEVNET_USDC_MINT = import.meta.env.VITE_DEVNET_USDC_MINT ?? "DevnetTestTokenMint111111111111111111111111111";
export const SOLANA_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL?.trim() || clusterApiUrl(SOLANA_NETWORK);

export function SolanaProvider({ children }: { children: ReactNode }) {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return <ConnectionProvider endpoint={SOLANA_RPC_URL}><WalletProvider wallets={wallets} autoConnect><WalletModalProvider>{children}</WalletModalProvider></WalletProvider></ConnectionProvider>;
}
