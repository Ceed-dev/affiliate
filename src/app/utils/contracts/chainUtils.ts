import { Polygon, PolygonAmoyTestnet } from "@thirdweb-dev/chains";

export const getActiveChain = () => {
  if (process.env.NEXT_PUBLIC_ACTIVE_CHAIN === "Polygon") {
    return Polygon;
  } else {
    return PolygonAmoyTestnet;
  }
};