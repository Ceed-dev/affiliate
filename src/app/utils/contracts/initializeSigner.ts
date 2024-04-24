import { ethers } from "ethers";

export function initializeSigner(providerUrl: string, privateKey?: string): ethers.Signer {
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  const signer = privateKey ? new ethers.Wallet(privateKey, provider) : provider.getSigner();

  return signer;
}