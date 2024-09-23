export type ClickData = {
  id?: string;
  timestamp: Date;
  ip: string;
  country: string;
  region: string;
  city: string;
  userAgent: string;
  referralId?: string;  // Optional referralId to track the referral source
};
