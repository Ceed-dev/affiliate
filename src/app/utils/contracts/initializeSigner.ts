import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

export function getProvider(url: string): ethers.providers.Provider {
  return new ethers.providers.JsonRpcProvider(url);
}

export function initializeSigner(url?: string, privateKey?: string): ethers.Signer | null {
  if (url && privateKey) {
    const provider = getProvider(url);
    const signer = new ethers.Wallet(privateKey, provider);
    return signer;
  } else if (typeof window !== "undefined" && window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = provider.getSigner();
    return signer;
  } else {
    return null;
  }
}