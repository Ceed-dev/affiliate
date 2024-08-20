export type ConversionLog = {
  timestamp: Date;
  amount: number;
  isPaid: boolean;
  transactionHashAffiliate?: string;
  paidAt?: Date;
  userWalletAddress?: string;
};