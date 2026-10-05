import { Connection, PublicKey } from "@solana/web3.js";

export type ProtocolStatus = {
  configured: boolean;
  deployed: boolean;
  network: "devnet";
  programId?: string;
  rpcUrl: string;
  mode: "anchor_protocol" | "legacy_spl_transfer" | "unconfigured";
  message: string;
};

function rpcUrl() { return process.env.SOLANA_RPC_URL?.trim() || process.env.VITE_SOLANA_RPC_URL?.trim() || "https://api.devnet.solana.com"; }

export async function getSolanaProtocolStatus(): Promise<ProtocolStatus> {
  const configuredId = process.env.SOLANA_PROTOCOL_PROGRAM_ID?.trim();
  if (!configuredId) return { configured: false, deployed: false, network: "devnet", rpcUrl: rpcUrl(), mode: "unconfigured", message: "No Anchor protocol program ID is configured. Real Devnet actions remain legacy SPL transfers and do not claim on-chain credentials." };
  try {
    const programId = new PublicKey(configuredId);
    const connection = new Connection(rpcUrl(), "confirmed");
    const account = await connection.getAccountInfo(programId, "confirmed");
    if (!account?.executable) return { configured: true, deployed: false, network: "devnet", programId: programId.toBase58(), rpcUrl: rpcUrl(), mode: "unconfigured", message: "The configured program address is not an executable Devnet account. Credential issuance and escrow instructions are blocked." };
    return { configured: true, deployed: true, network: "devnet", programId: programId.toBase58(), rpcUrl: rpcUrl(), mode: "anchor_protocol", message: "Anchor protocol program is executable on Solana Devnet. UI flows may use on-chain credential and escrow instructions when wallet and IDL are configured." };
  } catch {
    return { configured: true, deployed: false, network: "devnet", programId: configuredId, rpcUrl: rpcUrl(), mode: "unconfigured", message: "The configured protocol program ID or Devnet RPC could not be verified. No on-chain credential claim is made." };
  }
}
