import { ethers } from "ethers";

export function initializeSigner(privateKey: string, providerUrl: string): ethers.Signer {
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  return new ethers.Wallet(privateKey, provider);
}