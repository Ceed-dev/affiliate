export type ReferralData = {
  id?: string;
  affiliateWallet: string;
  projectId: string;
  createdAt: Date;
  conversions: number;
  earnings: number;
  lastConversionDate: Date | null;
  clicks: number;
};