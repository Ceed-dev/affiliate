import { 
  Chain, 
  Polygon, PolygonAmoyTestnet, 
  Arbitrum, ArbitrumNova, ArbitrumSepolia,
  Avalanche, AvalancheFuji,
  Binance, BinanceTestnet,
  MchVerse,
  HomeVerse,
  GesoVerse, GesotenVerseTestnet,
} from "@thirdweb-dev/chains";

// Production chains for mainnet environments
export const productionChains: Chain[] = [
  Polygon,
  Arbitrum,
  ArbitrumNova,
  Avalanche,
  Binance,
  MchVerse,
  HomeVerse,
  GesoVerse,
];

// Test chains for testnet environments
export const testChains: Chain[] = [
  PolygonAmoyTestnet,
  ArbitrumSepolia,
  AvalancheFuji,
  BinanceTestnet,
  GesotenVerseTestnet,
];

// RPC URLs for different chains
export const chainRpcUrls: { [chainId: number]: string } = {
  137: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`, // Polygon Mainnet
  80002: `https://polygon-amoy.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`, // Polygon Amoy Testnet
  42161: `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`, // Arbitrum Mainnet
  42170: `https://arbnova-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`, // Arbitrum Nova
  421614: `https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`, // Arbitrum Sepolia
  43114: "https://api.avax.network/ext/bc/C/rpc", // Avalanche Mainnet
  43113: "https://api.avax-test.network/ext/bc/C/rpc", // Avalanche Fuji Testnet
  56: "https://bsc-dataseed.bnbchain.org", // Binance Mainnet
  97: "https://data-seed-prebsc-1-s1.bnbchain.org:8545", // Binance Testnet
  29548: "https://rpc.oasys.mycryptoheroes.net", // MchVerse Mainnet
  19011: "https://rpc.mainnet.oasys.homeverse.games", // HomeVerse Mainnet
  428: "https://rpc.verse.gesoten.com", // GesoVerse Mainnet
  42801: "https://rpc.testnet.verse.gesoten.com", // GesotenVerse Testnet
};

// MchVerseTestnet and HomeVerseTestnet configurations are commented out.
// Uncomment the following sections if you plan to use these chains in the future:

// const MchVerseTestnet: Chain = {
//   name: "MCH Verse Testnet",
//   chain: "mchverse-testnet",
//   chainId: 420,
//   shortName: "mchversetest",
//   slug: "mchverse-testnet",
//   testnet: true,
//   rpc: ["https://rpc.oasys.sand.mchdfgh.xyz"],
//   nativeCurrency: {
//     name: "OAS",
//     symbol: "OAS",
//     decimals: 18,
//   },
//   explorers: [
//     {
//       name: "MCH Verse Testnet Explorer",
//       url: "https://explorer.oasys.sand.mchdfgh.xyz",
//       standard: "EIP3091",
//     },
//   ],
// };

// const HomeVerseTestnet: Chain = {
//   name: "Home Verse Testnet",
//   chain: "homeverse-testnet",
//   chainId: 40875,
//   shortName: "homeversetest",
//   slug: "homeverse-testnet",
//   testnet: true,
//   rpc: ["https://rpc.testnet.oasys.homeverse.games"],
//   nativeCurrency: {
//     name: "OAS",
//     symbol: "OAS",
//     decimals: 18,
//   },
//   explorers: [
//     {
//       name: "Home Verse Testnet Explorer",
//       url: "https://explorer.testnet.oasys.homeverse.games",
//       standard: "EIP3091",
//     },
//   ],
// };