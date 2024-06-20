export type UnpaidConversionLog = {
  logId: string;
  timestamp: Date;
  amount: number;
  referralId: string;
  affiliateWallet: string;
  projectId: string;
  selectedTokenAddress: string;
};