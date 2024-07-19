import { 
  Chain, 
  Polygon, PolygonAmoyTestnet, 
  Arbitrum, ArbitrumNova, ArbitrumSepolia,
  Avalanche, AvalancheFuji,
  MchVerse,
  HomeVerse,
} from "@thirdweb-dev/chains";

export const productionChains: Chain[] = [
  Polygon,
  Arbitrum,
  ArbitrumNova,
  Avalanche,
  MchVerse,
  HomeVerse,
];

export const testChains: Chain[] = [
  PolygonAmoyTestnet,
  ArbitrumSepolia,
  AvalancheFuji,
];

export const chainRpcUrls: { [chainId: number]: string } = {
  137: "https://polygon-mainnet.infura.io",
  80002: "https://rpc-amoy.polygon.technology",
  42161: "https://arb1.arbitrum.io/rpc",
  42170: "https://nova.arbitrum.io/rpc",
  421614: "https://sepolia-rollup.arbitrum.io/rpc",
  43114: "https://api.avax.network/ext/bc/C/rpc",
  43113: "https://api.avax-test.network/ext/bc/C/rpc",
  29548: "https://rpc.oasys.mycryptoheroes.net",
  19011: "https://rpc.mainnet.oasys.homeverse.games",
};