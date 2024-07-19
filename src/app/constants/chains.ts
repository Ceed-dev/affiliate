import { 
  Chain, 
  Polygon, PolygonAmoyTestnet, 
  Arbitrum, ArbitrumNova, ArbitrumSepolia, 
} from "@thirdweb-dev/chains";

export const productionChains: Chain[] = [
  Polygon,
  Arbitrum,
  ArbitrumNova,
];

export const testChains: Chain[] = [
  PolygonAmoyTestnet,
  ArbitrumSepolia,
];

export const chainRpcUrls: { [chainId: number]: string } = {
  137: "https://polygon-mainnet.infura.io",
  80002: "https://rpc-amoy.polygon.technology",
  42161: "https://arb1.arbitrum.io/rpc",
  42170: "https://nova.arbitrum.io/rpc",
  421614: "https://sepolia-rollup.arbitrum.io/rpc",
};