import { useMemo } from "react";
import { ethers } from "ethers";

export function initializeSigner(providerUrl: string, privateKey?: string): ethers.Signer {
  const provider = useMemo(() => new ethers.providers.JsonRpcProvider(providerUrl), [providerUrl]);
  const signer = useMemo(() => {
    return privateKey ? new ethers.Wallet(privateKey, provider) : provider.getSigner();
  }, [privateKey, provider]);

  return signer;
}