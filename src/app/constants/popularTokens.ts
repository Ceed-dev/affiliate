type Token = {
  symbol: string;
  address: string;
};

export const popularTokens: { [chainId: number]: Token[] } = {
  80002: 
    [
      { symbol: "USDC", address: "0x9b5F49000D02479d1300e041FFf1d74F49588749" },
      { symbol: "USDT", address: "0x013129e82C92f423d21f8985817912Bca5281f45" },
      { symbol: "JPYC", address: "0x78eE7D0677a9E1C921E688c86710949F5D97C41a" },
    ],
};