import { clusterApiUrl } from "@solana/web3.js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { useMemo, type ReactNode } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";

export const SOLANA_NETWORK = "devnet" as const;
export const DEVNET_USDC_MINT = import.meta.env.VITE_DEVNET_USDC_MINT ?? "DevnetTestTokenMint111111111111111111111111111";

export function SolanaProvider({ children }: { children: ReactNode }) {
  const endpoint = import.meta.env.VITE_SOLANA_RPC_URL ?? clusterApiUrl(SOLANA_NETWORK);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return <ConnectionProvider endpoint={endpoint}><WalletProvider wallets={wallets} autoConnect={false}><WalletModalProvider>{children}</WalletModalProvider></WalletProvider></ConnectionProvider>;
}
