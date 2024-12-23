import { Chain } from "thirdweb/chains";

export type UnpaidConversionLog = {
  logId: string;
  timestamp: Date;
  amount: number;
  userWalletAddress?: string;
  referralId: string;
  affiliateWallet: string;
  projectId: string;
  selectedChain: Chain;
  selectedTokenAddress: string;
  conversionId: string;
};