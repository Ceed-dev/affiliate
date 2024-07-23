import { 
  Chain, 
  Polygon, PolygonAmoyTestnet, 
  Arbitrum, ArbitrumNova, ArbitrumSepolia,
  Avalanche, AvalancheFuji,
  MchVerse,
  HomeVerse,
  GesoVerse, GesotenVerseTestnet,
} from "@thirdweb-dev/chains";

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

export const productionChains: Chain[] = [
  Polygon,
  Arbitrum,
  ArbitrumNova,
  Avalanche,
  MchVerse,
  HomeVerse,
  GesoVerse,
];

export const testChains: Chain[] = [
  PolygonAmoyTestnet,
  ArbitrumSepolia,
  AvalancheFuji,
  // MchVerseTestnet,
  // HomeVerseTestnet,
  GesotenVerseTestnet,
];

export const chainRpcUrls: { [chainId: number]: string } = {
  // 137: "https://polygon-mainnet.infura.io", // Polygon
  137: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`, // Polygon
  // 80002: "https://rpc-amoy.polygon.technology", // PolygonAmoyTestnet
  80002: `https://polygon-amoy.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`, // PolygonAmoyTestnet
  // 42161: "https://arb1.arbitrum.io/rpc", // Arbitrum
  42161: `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`, // Arbitrum
  // 42170: "https://nova.arbitrum.io/rpc", // ArbitrumNova
  42170: `https://arbnova-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`, // ArbitrumNova
  // 421614: "https://sepolia-rollup.arbitrum.io/rpc", // ArbitrumSepolia
  421614: `https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`, // ArbitrumSepolia
  43114: "https://api.avax.network/ext/bc/C/rpc", // Avalanche
  43113: "https://api.avax-test.network/ext/bc/C/rpc", // AvalancheFuji
  29548: "https://rpc.oasys.mycryptoheroes.net", // MchVerse
  // 420: "https://rpc.oasys.sand.mchdfgh.xyz", // MchVerseTestnet
  19011: "https://rpc.mainnet.oasys.homeverse.games", // HomeVerse
  // 40875: "https://rpc.testnet.oasys.homeverse.games", // HomeVerseTestnet
  428: "https://rpc.verse.gesoten.com", // GesoVerse
  42801: "https://rpc.testnet.verse.gesoten.com", // GesotenVerseTestnet
};