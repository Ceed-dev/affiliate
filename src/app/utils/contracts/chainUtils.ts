import { getProvider } from "./initializeSigner";
import { productionChains, testChains, chainRpcUrls } from "../../constants/chains";

export const getChains = () => {
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === "production") {
    return productionChains;
  } else {
    return testChains;
  }
};

export const isEOA = async (address: string, chainId: number): Promise<boolean> => {
  const provider = getProvider(chainRpcUrls[chainId]);
  try {
    const code = await provider.getCode(address);
    return code === "0x";
  } catch (error) {
    console.error("Error checking address:", error);
    return false;
  }
};