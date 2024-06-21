export type ConversionLog = {
  timestamp: Date;
  amount: number;
  isPaid: boolean;
  transactionHash?: string;
  paidAt?: Date;
};