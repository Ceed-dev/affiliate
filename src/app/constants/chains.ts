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

export const chainRpcUrls: { [chainId: number]: string } = {
  137: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  80002: `https://polygon-amoy.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  42161: `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  421614: `https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
};