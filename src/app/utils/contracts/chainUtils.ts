import { Polygon, PolygonAmoyTestnet } from "@thirdweb-dev/chains";
import { getProvider } from "./initializeSigner";

export const getActiveChain = () => {
  if (process.env.NEXT_PUBLIC_ACTIVE_CHAIN === "Polygon") {
    return Polygon;
  } else {
    return PolygonAmoyTestnet;
  }
};

export const isEOA = async (address: string): Promise<boolean> => {
  const provider = getProvider();
  try {
    const code = await provider.getCode(address);
    return code === "0x";
  } catch (error) {
    console.error("Error checking address:", error);
    return false;
  }
};