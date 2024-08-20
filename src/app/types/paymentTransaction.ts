export type PaymentTransaction = {
  transactionHashAffiliate: string;
  transactionHashUser?: string; // Optional field for user payment transaction hash
  timestamp: Date;
  amount: number;
  conversionLogId: string;
};