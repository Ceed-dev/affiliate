type Token = {
  symbol: string;
  address: string;
};

export const popularTokens: { [chainId: number]: Token[] } = {
  // Polygon
  137:
    [
      { symbol: "USDC", address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" },
      { symbol: "USDT", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" },
      { symbol: "JPYC", address: "0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB" },
    ],
  // PolygonAmoyTestnet
  80002: 
    [
      { symbol: "USDC", address: "0x9b5F49000D02479d1300e041FFf1d74F49588749" },
      { symbol: "USDT", address: "0x013129e82C92f423d21f8985817912Bca5281f45" },
      { symbol: "JPYC", address: "0x78eE7D0677a9E1C921E688c86710949F5D97C41a" },
    ],
  // Arbitrum
  42161:
    [
      { symbol: "USDC", address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" },
      { symbol: "USDT", address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9" },
    ],
  // ArbitrumNova
  42170:
    [],
  // ArbitrumSepolia
  421614:
    [],
  // Avalanche
  43114:
    [
      { symbol: "USDC", address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E" },
      { symbol: "USDT", address: "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7" },
      { symbol: "JPYC", address: "0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB" },
    ],
  // AvalancheFuji
  43113:
    [],
};