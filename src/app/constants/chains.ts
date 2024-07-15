import { 
  Chain, 
  Polygon, PolygonAmoyTestnet, 
  Arbitrum, ArbitrumSepolia, 
} from "@thirdweb-dev/chains";

export const productionChains: Chain[] = [
  Polygon,
  Arbitrum,
];

export const testChains: Chain[] = [
  PolygonAmoyTestnet,
  ArbitrumSepolia,
];
