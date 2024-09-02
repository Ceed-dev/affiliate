export type ConversionLog = {
  timestamp: Date;
  amount: number;
  conversionId: string;
  isPaid: boolean;
  transactionHashAffiliate?: string;
  paidAt?: Date;
  userWalletAddress?: string;
};