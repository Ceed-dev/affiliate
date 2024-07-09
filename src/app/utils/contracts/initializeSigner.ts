import { ethers } from "ethers";

export function getProvider(): ethers.providers.Provider {
  return new ethers.providers.JsonRpcProvider(`${process.env.NEXT_PUBLIC_PROVIDER_URL}`);
}

export function initializeSigner(privateKey?: string): ethers.Signer | null {
  if (privateKey) {
    const provider = getProvider();
    const signer = new ethers.Wallet(privateKey, provider);
    return signer;
  } else if (typeof window !== "undefined" && window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return signer;
  } else {
    return null;
  }
}